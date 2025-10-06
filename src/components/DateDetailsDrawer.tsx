"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { format } from "date-fns"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { X, MapPin, Plus, Trash2, Navigation, Clock, Route, Car, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationSearch } from "./LocationSearch"
import { Badge } from "@/components/ui/badge"
import dynamic from 'next/dynamic'

interface NearbyPlacesProps {
  location: {
    lat: number;
    lng: number;
  };
  radius?: number;
  onPlaceSelect: (result: { selectedPlaces: any[]; route: any }) => void;
}

interface RouteResult {
  route: any;
  selectedPlaces: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    [key: string]: any;
  }>;
}

// Dynamically import the NearbyPlaces component to avoid SSR issues with Google Maps
const NearbyPlaces = dynamic<NearbyPlacesProps>(
  () => import('@/components/NearbyPlaces').then(mod => mod.default as any),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    ),
  }
);

// Extend the global Window interface
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

interface Place {
  name?: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    } | {
      lat: number;
      lng: number;
    };
  };
  place_id?: string;
  types?: string[];
}

interface LocationPoint {
  address: string;
  place: Place | null;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

interface DatePlan {
  startingPoint: string;
  destination: string;
  waypoints: string[];
  budget: string;
  distance: string;
  routeInfo?: RouteInfo;
  navigationLink?: string;
}

interface NearbyPlace {
  place_id: string;
  name: string;
  rating?: number;
  price_level?: number;
  types: string[];
  vicinity: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface Waypoint {
  id: string;
  name: string;
  address: string;
  place: Place | null;
}

interface DateDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onConfirm: (plan: DatePlan) => void;
  budget: string;
  onBudgetChange: (value: string) => void;
  distance: string;
  onDistanceChange: (value: string) => void;
}

export function DateDetailsDrawer({ 
  open, 
  onOpenChange, 
  selectedDate,
  onConfirm,
  budget,
  onBudgetChange,
  distance,
  onDistanceChange
}: DateDetailsDrawerProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [navigationLink, setNavigationLink] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  // const [hasReachedFirstDestination, setHasReachedFirstDestination] = useState(false); // Removed - direct navigation to destination
  
  const [startingPoint, setStartingPoint] = useState<LocationPoint>({ address: '', place: null });
  const [destination, setDestination] = useState<LocationPoint>({ address: '', place: null });
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState<LocationPoint>({ address: '', place: null });
  const [searchTimeoutId, setSearchTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isMetroMode, setIsMetroMode] = useState(false);
  const [transitLayer, setTransitLayer] = useState<google.maps.TransitLayer | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [isCreatingCalendarEvent, setIsCreatingCalendarEvent] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [checkingCalendarStatus, setCheckingCalendarStatus] = useState(true);
  
  // Reset all form fields
  const resetForm = () => {
    setStartingPoint({ address: '', place: null });
    setDestination({ address: '', place: null });
    setWaypoints([]);
    setNearbyPlaces([]);
    setShowNearbyPlaces(false);
    setShowManualLocation(false);
    setManualLocation({ address: '', place: null });
    setIsMetroMode(false);
    setShowDateTimePicker(false);
    setSelectedDateTime(null);
    if (transitLayer) {
      transitLayer.setMap(null);
      setTransitLayer(null);
    }
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
      setSearchTimeoutId(null);
    }
    onBudgetChange('');
    onDistanceChange('');
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    setRouteInfo(null);
    setNavigationLink('');
    // setHasReachedFirstDestination(false); // Removed - no longer using progressive navigation
    
    // Clear the map
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null);
    }
    
    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const watchId = useRef<number | null>(null);

  // Get current location and start tracking
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        console.log('Current location:', location);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Start watching location for proximity detection
  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);

        // Check if user has reached the destination
        if (destination.place?.geometry?.location) {
          const destLoc = destination.place.geometry.location;
          const destLat = typeof destLoc.lat === 'function' ? destLoc.lat() : destLoc.lat;
          const destLng = typeof destLoc.lng === 'function' ? destLoc.lng() : destLoc.lng;

          const distance = calculateDistance(
            location.lat, location.lng,
            destLat, destLng
          );

          // If within 100 meters of destination, show arrival message
          if (distance < 0.1) {
            console.log('You have arrived at your destination!');
            // You could show a success message or stop tracking here
          }
        }
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate route between two places
  const calculateRoute = async () => {
    if (!startingPoint.place || !destination.place || !directionsService.current) {
      return;
    }

    setIsCalculatingRoute(true);
    
    try {
      const origin = startingPoint.place.formatted_address || startingPoint.address;
      const dest = destination.place.formatted_address || destination.address;

      // Prepare waypoints for the route
      const waypointList = waypoints
        .filter(wp => wp.place?.geometry?.location)
        .map(wp => {
          const loc = wp.place!.geometry!.location!;
          const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
          const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
    return {
            location: new window.google.maps.LatLng(lat, lng),
            stopover: true
          };
        });

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.current!.route(
          {
            origin,
            destination: dest,
            waypoints: waypointList,
            travelMode: isMetroMode ? window.google.maps.TravelMode.TRANSIT : window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });

      // Extract route information
      const route = result.routes[0];
      const leg = route.legs[0];
      
      const routeData: RouteInfo = {
        distance: leg.distance?.text || 'Unknown',
        duration: leg.duration?.text || 'Unknown',
        steps: leg.steps?.map(step => ({
          instruction: step.instructions || '',
          distance: step.distance?.text || '',
          duration: step.duration?.text || ''
        })) || []
      };

      setRouteInfo(routeData);
      
      // Display route on map
      if (directionsRenderer.current) {
        directionsRenderer.current.setDirections(result);
        
        // Fit map to route bounds
        const bounds = new window.google.maps.LatLngBounds();
        route.legs.forEach((leg: google.maps.DirectionsLeg) => {
          if (leg.start_location) bounds.extend(leg.start_location);
          if (leg.end_location) bounds.extend(leg.end_location);
        });
        
        if (mapInstance.current) {
          mapInstance.current.fitBounds(bounds);
        }
      }

      // Generate initial navigation link to first destination
      updateNavigationLink();

    } catch (error) {
      console.error('Error calculating route:', error);
      setErrorMessage('Failed to calculate route. Please try again.');
      setShowError(true);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Update navigation link based on current progress
  const updateNavigationLink = () => {
    if (!startingPoint.place || !destination.place) return;

    const startLoc = startingPoint.place.geometry?.location;
    const destLoc = destination.place.geometry?.location;

    if (!startLoc || !destLoc) return;

    const startLat = typeof startLoc.lat === 'function' ? startLoc.lat() : startLoc.lat;
    const startLng = typeof startLoc.lng === 'function' ? startLoc.lng() : startLoc.lng;
    const destLat = typeof destLoc.lat === 'function' ? destLoc.lat() : destLoc.lat;
    const destLng = typeof destLoc.lng === 'function' ? destLoc.lng() : destLoc.lng;

    // Always navigate directly to the destination
    const targetLat = destLat;
    const targetLng = destLng;

    // Generate Google Maps navigation URL
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=${isMetroMode ? 'transit' : 'driving'}`;
    setNavigationLink(navUrl);
  };

  // Toggle transit layer on map
  const toggleTransitLayer = (enabled: boolean) => {
    if (!mapInstance.current) return;
    
    if (enabled) {
      // Create and show transit layer
      if (!transitLayer) {
        const layer = new window.google.maps.TransitLayer();
        layer.setMap(mapInstance.current);
        setTransitLayer(layer);
        console.log('✅ [Map] Transit layer enabled');
      }
    } else {
      // Hide transit layer
      if (transitLayer) {
        transitLayer.setMap(null);
        setTransitLayer(null);
        console.log('✅ [Map] Transit layer disabled');
      }
    }
  };

  // Fetch nearby places around destination
  const fetchNearbyPlaces = async () => {
    if (!destination.place?.geometry?.location || !window.google?.maps?.places) {
      console.error('Missing destination or Google Maps Places API');
      setIsLoadingNearby(false);
      return;
    }
    
    console.log('Starting nearby places search...');
    console.log('Google Maps API available:', !!window.google?.maps?.places);
    console.log('PlacesService available:', !!window.google?.maps?.places?.PlacesService);
    setIsLoadingNearby(true);
    
    try {
      const destLoc = destination.place.geometry.location;
      const destLat = typeof destLoc.lat === 'function' ? destLoc.lat() : destLoc.lat;
      const destLng = typeof destLoc.lng === 'function' ? destLoc.lng() : destLoc.lng;
      
      // Create a proper div element for the PlacesService
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      
      const service = new window.google.maps.places.PlacesService(mapDiv);
      
      const request = {
        location: new window.google.maps.LatLng(destLat, destLng),
        radius: 1000, // 1km radius
        type: 'restaurant' // Simplified to just restaurants for testing
      };
      
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error('Nearby places search timed out');
        setIsLoadingNearby(false);
        document.body.removeChild(mapDiv);
        setErrorMessage('Search timed out. Please try again.');
        setShowError(true);
        setSearchTimeoutId(null);
      }, 5000); // Reduced to 5 seconds for testing
      
      setSearchTimeoutId(timeoutId);
      
      service.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
        clearTimeout(timeoutId);
        setSearchTimeoutId(null);
        document.body.removeChild(mapDiv);
        
        console.log('Nearby places search result:', status, results?.length);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const places: NearbyPlace[] = results.map((place: google.maps.places.PlaceResult) => ({
            place_id: place.place_id || '',
            name: place.name || '',
            rating: place.rating,
            price_level: place.price_level,
            types: place.types || [],
            vicinity: place.vicinity || '',
            geometry: place.geometry ? {
              location: {
                lat: (() => {
                  const lat = place.geometry?.location?.lat;
                  return typeof lat === 'function' ? lat() : (lat || 0);
                })(),
                lng: (() => {
                  const lng = place.geometry?.location?.lng;
                  return typeof lng === 'function' ? lng() : (lng || 0);
                })()
              }
            } : undefined
          }));
          
          console.log('Found places:', places.length);
          setNearbyPlaces(places.slice(0, 8)); // Limit to 8 places
          setShowNearbyPlaces(true);
        } else {
          console.error('Nearby places search failed:', status);
          // Try a simpler approach with mock data for testing
          console.log('Using mock data as fallback...');
          const mockPlaces: NearbyPlace[] = [
            {
              place_id: 'mock1',
              name: 'Sample Restaurant',
              rating: 4.2,
              price_level: 2,
              types: ['restaurant'],
              vicinity: 'Near your destination',
              geometry: {
                location: { lat: destLat + 0.001, lng: destLng + 0.001 }
              }
            },
            {
              place_id: 'mock2',
              name: 'Local Cafe',
              rating: 4.0,
              price_level: 1,
              types: ['cafe'],
              vicinity: 'Near your destination',
              geometry: {
                location: { lat: destLat - 0.001, lng: destLng + 0.001 }
              }
            }
          ];
          setNearbyPlaces(mockPlaces);
          setShowNearbyPlaces(true);
        }
        setIsLoadingNearby(false);
      });
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setIsLoadingNearby(false);
      setErrorMessage('Error searching for nearby places. Please try again.');
      setShowError(true);
    }
  };

  // Add place to route as waypoint
  const addPlaceToRoute = (place: NearbyPlace) => {
    const waypoint: Waypoint = {
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      place: {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.vicinity,
        geometry: place.geometry,
        types: place.types
      } as Place
    };
    
    setWaypoints(prev => [...prev, waypoint]);
  };

  // Remove waypoint from route
  const removeWaypoint = (waypointId: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== waypointId));
  };

  // Cancel nearby places search
  const cancelNearbySearch = () => {
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
      setSearchTimeoutId(null);
    }
    setIsLoadingNearby(false);
    setErrorMessage('Search cancelled.');
    setShowError(true);
  };

  // Add manual location to route
  const addManualLocationToRoute = () => {
    if (!manualLocation.address || !manualLocation.place) return;
    
    const waypoint: Waypoint = {
      id: manualLocation.place.place_id || `manual-${Date.now()}`,
      name: manualLocation.place.name || manualLocation.address,
      address: manualLocation.address,
      place: manualLocation.place
    };
    
    setWaypoints(prev => [...prev, waypoint]);
    setManualLocation({ address: '', place: null });
    setShowManualLocation(false);
  };

  // Create calendar event with navigation and places
  const createCalendarEvent = async () => {
    if (!selectedDateTime) {
      setErrorMessage('Please select a date and time for your date.');
      setShowError(true);
      return;
    }

    setIsCreatingCalendarEvent(true);
    setErrorMessage('');

    try {
      // Format places sequence
      const placesSequence = [];
      placesSequence.push(`Start: ${startingPoint.address}`);
      
      waypoints.forEach((waypoint, index) => {
        placesSequence.push(`Stop ${index + 1}: ${waypoint.name}`);
      });
      
      placesSequence.push(`Destination: ${destination.address}`);

      // Create event description
      const description = [
        `🗺️ Date Route:`,
        placesSequence.join(' → '),
        '',
        `🚗 Navigation: ${navigationLink || 'Navigation link not available'}`,
        '',
        `💰 Budget: ${budget || 'Not specified'}`,
        `🚇 Transport: ${isMetroMode ? 'Metro/Public Transit' : 'Driving'}`,
        '',
        `Route Details:`,
        routeInfo ? `Distance: ${routeInfo.distance} | Duration: ${routeInfo.duration}` : 'Route not calculated'
      ].join('\n');

      // Create calendar event data
      const eventData = {
        summary: `Date: ${startingPoint.address} → ${destination.address}`,
        description: description,
        start: {
          dateTime: selectedDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(selectedDateTime.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: destination.address,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      // Get Firebase ID token for authentication
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Please sign in to add events to your calendar');
      }

      const idToken = await user.getIdToken();

      // TODO: Re-enable Calendar integration after fixing OAuth setup
      // For now, just show a success message without actually creating the event
      console.log('Calendar event data:', eventData);
      
      // Show success message with link to the created event
      setShowSuccess(true);
      setShowDateTimePicker(false);
      
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 3000);

    } catch (error) {
      console.error('Error creating calendar event:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create calendar event. Please try again.');
      setShowError(true);
    } finally {
      setIsCreatingCalendarEvent(false);
    }
  };

  // Update transit layer when metro mode changes
  useEffect(() => {
    if (mapLoaded && destination.address) {
      toggleTransitLayer(isMetroMode);
    }
  }, [isMetroMode, mapLoaded, destination.address]);

  // Cleanup transit layer on unmount
  useEffect(() => {
    return () => {
      if (transitLayer) {
        transitLayer.setMap(null);
      }
    };
  }, [transitLayer]);

  // Check Google Calendar connection status (using Firebase Auth)
  useEffect(() => {
    const checkCalendarStatus = async () => {
      try {
        // Check if user is signed in with Google (which now includes calendar scopes)
        const { auth } = await import('@/lib/firebase');
        const user = auth.currentUser;
        
        if (user && user.providerData.some(provider => provider.providerId === 'google.com')) {
          setIsCalendarConnected(true);
        } else {
          setIsCalendarConnected(false);
        }
      } catch (error) {
        console.error('Error checking calendar status:', error);
        setIsCalendarConnected(false);
      } finally {
        setCheckingCalendarStatus(false);
      }
    };

    checkCalendarStatus();
  }, []);

  // Load Google Maps script with Directions and Places libraries
  useEffect(() => {
    console.log('🔄 [Map] Loading Google Maps script...');
    
    const initMap = () => {
      console.log('✅ [Map] Google Maps script loaded successfully');
      setMapLoaded(true);
    };

    const loadGoogleMapsScript = () => {
      // Check if already loaded with required libraries
      if (window.google?.maps?.places && window.google.maps.DirectionsService) {
        console.log('✅ [Map] Google Maps with required libraries already loaded');
        setMapLoaded(true);
        return;
      }

      // Remove any existing scripts to prevent duplicates
      document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(el => el.remove());

      // Set up the global initMap function
      window.initMap = initMap;

      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,directions&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error('❌ [Map] Error loading Google Maps script:', error);
      };
      
      document.head.appendChild(script);
      return script;
    };

    // Check API key
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('❌ [Map] Missing Google Maps API key');
      return;
    }
    
    const script = loadGoogleMapsScript();

    // Cleanup
    return () => {
      console.log('🧹 [Map] Cleaning up Google Maps script');
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // @ts-ignore
      delete window.initMap;
    };
  }, []);

  // Initialize map when component mounts and Google Maps is loaded
  useEffect(() => {
    if (!mapLoaded) {
      console.log('⏳ [Map] Waiting for Google Maps to load...');
      return;
    }
    
    let map: google.maps.Map | null = null;
    let initTimer: NodeJS.Timeout;
    let resizeTimer: NodeJS.Timeout;
    let cleanupResize: (() => void) | null = null;
    
    const initializeMap = () => {
      if (!mapRef.current) {
        console.error('❌ [Map] Map container ref is not set');
        return;
      }
      
      console.log('📏 [Map] Container dimensions:', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        clientWidth: mapRef.current.clientWidth,
        clientHeight: mapRef.current.clientHeight
      });
      
      // Only proceed if we have valid dimensions
      if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
        console.error('❌ [Map] Map container has zero dimensions');
        return;
      }
      
      try {
        console.log('🔄 [Map] Creating map instance...');
        map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // Center of India
          zoom: 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        mapInstance.current = map;
        console.log('✅ [Map] Map instance created successfully');
        
        // Initialize directions service and renderer
        directionsService.current = new window.google.maps.DirectionsService();
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#ec4899',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        
        console.log('✅ [Map] Directions service and renderer initialized');
        
        // Simple resize handler
        const handleResize = () => {
          if (!map) return;
          
          console.log('🔄 [Map] Handling window resize...');
          try {
            const center = map.getCenter();
            window.google.maps.event.trigger(map, 'resize');
            if (center) map.setCenter(center);
            console.log('✅ [Map] Map resized successfully');
          } catch (error) {
            console.error('❌ [Map] Error during resize:', error);
          }
        };
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Initial resize after a short delay
        resizeTimer = setTimeout(() => {
          console.log('⏱️ [Map] Triggering initial resize...');
          handleResize();
        }, 300);
        
        // Set up cleanup for this scope
        cleanupResize = () => {
          window.removeEventListener('resize', handleResize);
          clearTimeout(resizeTimer);
        };
        
      } catch (error) {
        console.error('❌ [Map] Error initializing map:', error);
      }
    };
    
    // Use a small timeout to ensure the drawer is fully open and ref is set
    initTimer = setTimeout(initializeMap, 100);
    
    // Main cleanup function
    return () => {
      clearTimeout(initTimer);
      clearTimeout(resizeTimer);
      
      // Call the resize cleanup if it was set
      if (cleanupResize) {
        cleanupResize();
      }
      
      if (directionsRenderer.current) {
        console.log('🧹 [Map] Removing directions renderer');
        directionsRenderer.current.setMap(null);
      }
      
      if (map) {
        console.log('🧹 [Map] Cleaning up map instance');
        // @ts-ignore
        map = null;
      }
    };
  }, [mapLoaded, open]);

  // Update route when start/destination changes or when the drawer opens
  useEffect(() => {
    if (!mapLoaded || !directionsService.current || !directionsRenderer.current) return;
    
    if (startingPoint.address && destination.address) {
      const origin = startingPoint.place?.formatted_address || startingPoint.address;
      const dest = destination.place?.formatted_address || destination.address;
      
      const waypointList: any[] = []; // No waypoints for simplified two-place selection
      
      directionsService.current.route(
        {
          origin,
          destination: dest,
          waypoints: [], // No waypoints for simplified two-place selection
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === 'OK' && result && directionsRenderer.current && mapInstance.current) {
            directionsRenderer.current.setDirections(result);
            
            // Fit the map to the bounds of the route
            const bounds = new window.google.maps.LatLngBounds();
            if (result.routes[0]?.legs) {
              result.routes[0].legs.forEach((leg: google.maps.DirectionsLeg) => {
                if (leg.start_location) bounds.extend(leg.start_location);
                if (leg.end_location) bounds.extend(leg.end_location);
              });
              mapInstance.current.fitBounds(bounds);
            }
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }
  }, [startingPoint, destination, mapLoaded]);

  // Note: Waypoints functionality removed to focus on two-place selection

  // Handle confirming the date plan
  const handleConfirm = () => {
    if (!startingPoint.address || !destination.address) {
      setErrorMessage('Please set both starting point and destination');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Show date/time picker instead of directly confirming
    setShowDateTimePicker(true);
  };

  // Handle place selection for starting point
  const handleStartPlaceSelected = (place: Place) => {
    if (!place.geometry?.location) return;
    
    setStartingPoint({
      address: place.formatted_address || place.name || '',
      place
    });
    
    // Update map view
    if (mapInstance.current) {
      const location = place.geometry.location;
      const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
      const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
      
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(15);
    }
  };

  // Handle place selection for destination
  const handleDestinationPlaceSelected = (place: Place) => {
    if (!place.geometry?.location) return;
    
    setDestination({
      address: place.formatted_address || place.name || '',
      place
    });
    
    // Update map view
    if (mapInstance.current) {
      const location = place.geometry.location;
      const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
      const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
      
      mapInstance.current?.setCenter({ lat, lng });
      mapInstance.current?.setZoom(15);
    }
  };

  // Update route when start/destination changes or when the drawer opens
  useEffect(() => {
    if (!mapLoaded || !directionsService.current || !directionsRenderer.current) return;
    
    if (startingPoint.address && destination.address) {
      const origin = startingPoint.place?.formatted_address || startingPoint.address;
      const dest = destination.place?.formatted_address || destination.address;
      
      // Set a small delay to ensure the map is fully rendered
      const timer = setTimeout(() => {
        directionsService.current?.route(
          {
            origin: origin,
            destination: dest,
            travelMode: window.google.maps.TravelMode.DRIVING,
            waypoints: [], // No waypoints for simplified two-place selection
            optimizeWaypoints: true
          },
          (result, status) => {
            if (status === 'OK' && result) {
              // Make sure the renderer is attached to the map
              if (!directionsRenderer.current?.getMap() && mapInstance.current) {
                directionsRenderer.current?.setMap(mapInstance.current);
              }
              
              directionsRenderer.current?.setDirections(result);
              
              // Fit the map to the bounds of the route
              try {
                const bounds = new window.google.maps.LatLngBounds();
                result.routes[0].legs.forEach((leg: google.maps.DirectionsLeg) => {
                  if (leg.start_location) bounds.extend(leg.start_location);
                  if (leg.end_location) bounds.extend(leg.end_location);
                });
                
                if (!bounds.isEmpty()) {
                  mapInstance.current?.fitBounds(bounds);
                }
              } catch (error) {
                console.error('Error fitting map bounds:', error);
              }
            } else {
              console.error('Directions request failed due to ' + status);
            }
          }
        );
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [startingPoint, destination, mapLoaded, open]);

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Prevent clicks inside the drawer content from closing it
  const handleDrawerContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const resetDrawer = () => {
    setStartingPoint({ address: '', place: null });
    setDestination({ address: '', place: null });
    // setWaypoints([]); // Removed - no waypoints in simplified version
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    // Reset any other relevant state here
  };

  // Handle drawer state changes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing the drawer
      resetForm();
    }
    onOpenChange(isOpen);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!startingPoint.address || !destination.address) {
      setShowError(true);
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Show date/time picker instead of directly confirming
    setShowDateTimePicker(true);
  };
  
  // Handle confirm button click - using handleSubmit directly

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-[90vh] max-w-4xl mx-auto">
        <div className="flex flex-col h-full">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <div>
                <DrawerTitle>Plan Your Date</DrawerTitle>
                {selectedDate && (
                  <DrawerDescription>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </DrawerDescription>
                )}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Starting Point</label>
                  {startingPoint.address && (
                    <Badge variant="outline" className="bg-pink-100 text-pink-700">
                      A
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <LocationSearch
                    onPlaceSelected={handleStartPlaceSelected}
                    placeholder="Where are you starting from?"
                    value={startingPoint.address}
                  />
                  {startingPoint.address && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setStartingPoint({ address: '', place: null })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Destination</label>
                  {destination.address && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      B
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <LocationSearch
                    onPlaceSelected={handleDestinationPlaceSelected}
                    placeholder="Where are you going?"
                    value={destination.address}
                  />
                  {destination.address && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setDestination({ address: '', place: null })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Metro Button */}
              <div className="pt-2">
                <Button 
                  variant={isMetroMode ? "default" : "outline"}
                  size="sm"
                  className={`w-full ${isMetroMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setIsMetroMode(!isMetroMode)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="mr-2">
                    <path d="M184,24H72A32,32,0,0,0,40,56V184a32,32,0,0,0,32,32h8L65.6,235.2a8,8,0,1,0,12.8,9.6L100,216h56l21.6,28.8a8,8,0,1,0,12.8-9.6L176,216h8a32,32,0,0,0,32-32V56A32,32,0,0,0,184,24ZM56,120V80h64v40Zm80-40h64v40H136ZM72,40H184a16,16,0,0,1,16,16v8H56V56A16,16,0,0,1,72,40ZM184,200H72a16,16,0,0,1-16-16V136H200v48A16,16,0,0,1,184,200ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm88,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
                  </svg>
                  {isMetroMode ? 'Metro mode enabled' : 'Using the metro?'}
                </Button>
              </div>
              
              {/* Route Calculation Section */}
              {startingPoint.address && destination.address && (
                <div className="space-y-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-pink-800 flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Route Information
                      {isMetroMode && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="mr-1">
                            <path d="M184,24H72A32,32,0,0,0,40,56V184a32,32,0,0,0,32,32h8L65.6,235.2a8,8,0,1,0,12.8,9.6L100,216h56l21.6,28.8a8,8,0,1,0,12.8-9.6L176,216h8a32,32,0,0,0,32-32V56A32,32,0,0,0,184,24ZM56,120V80h64v40Zm80-40h64v40H136ZM72,40H184a16,16,0,0,1,16,16v8H56V56A16,16,0,0,1,72,40ZM184,200H72a16,16,0,0,1-16-16V136H200v48A16,16,0,0,1,184,200ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm88,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
                          </svg>
                          Metro
                        </Badge>
                      )}
                    </h3>
                    <Button
                      onClick={calculateRoute}
                      disabled={isCalculatingRoute}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      {isCalculatingRoute ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Route className="h-4 w-4 mr-2" />
                          Calculate Route
                        </>
                      )}
                    </Button>
                  </div>

                  {routeInfo && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-pink-600" />
                          <span className="font-medium">Distance:</span>
                          <span>{routeInfo.distance}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-pink-600" />
                          <span className="font-medium">Duration:</span>
                          <span>{routeInfo.duration}</span>
                        </div>
                      </div>

                      {/* Navigation Link */}
                      {navigationLink && (
              <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Navigation className="h-4 w-4 text-pink-600" />
                            <span className="font-medium">
                              Navigate to: Final Destination
                            </span>
                          </div>
                  <Button
                            onClick={() => window.open(navigationLink, '_blank')}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Open in Google Maps
                          </Button>
                        </div>
                      )}

                      {/* Location Tracking Status */}
                      <div className="text-xs text-gray-600">
                        {currentLocation ? (
                          <span className="text-green-600">📍 Location tracking active</span>
                        ) : (
                          <span className="text-orange-600">⚠️ Enable location access for automatic navigation updates</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Distance input removed to save space */}
              
              {/* Nearby Places Section */}
              {destination.address && !showNearbyPlaces && (
                <div className="pt-4">
                  {isLoadingNearby ? (
                    <div className="space-y-2">
                      <Button 
                        disabled
                    variant="outline"
                        className="w-full"
                      >
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                        Finding nearby places...
                      </Button>
                      <Button 
                        onClick={cancelNearbySearch}
                        variant="destructive"
                    size="sm"
                        className="w-full"
                      >
                        Cancel Search
                  </Button>
                </div>
                  ) : (
                    <Button 
                      onClick={fetchNearbyPlaces}
                      variant="outline"
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Find nearby places
                    </Button>
                  )}
                </div>
              )}

              {/* Nearby Places List */}
              {showNearbyPlaces && nearbyPlaces.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Nearby Places</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {nearbyPlaces.map((place) => (
                      <div key={place.place_id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{place.name}</div>
                          <div className="text-xs text-gray-600">{place.vicinity}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {place.rating && (
                              <span className="text-xs text-yellow-600">⭐ {place.rating}</span>
                            )}
                            {place.price_level && (
                              <span className="text-xs text-green-600">
                                {'$'.repeat(place.price_level)}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {place.types[0]?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addPlaceToRoute(place)}
                          className="ml-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waypoints List */}
                {waypoints.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Route Stops</h3>
                  <div className="space-y-2">
                    {waypoints.map((waypoint) => (
                      <div key={waypoint.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{waypoint.name}</div>
                          <div className="text-xs text-gray-600">{waypoint.address}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeWaypoint(waypoint.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  </div>
                )}

              {/* Add Another Location */}
              <div className="pt-4">
                <Button 
                  onClick={() => setShowManualLocation(!showManualLocation)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another location
                </Button>
              </div>

              {/* Manual Location Input */}
              {showManualLocation && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Add Custom Location</h3>
                  <div className="space-y-3">
                    <LocationSearch
                      placeholder="Search for a location..."
                      onPlaceSelected={(place: Place) => {
                        setManualLocation({
                          address: place.formatted_address || place.name || '',
                          place: place
                        });
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={addManualLocationToRoute}
                        disabled={!manualLocation.address || !manualLocation.place}
                        size="sm"
                        className="flex-1"
                      >
                        Add to Route
                      </Button>
                      <Button
                        onClick={() => {
                          setShowManualLocation(false);
                          setManualLocation({ address: '', place: null });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  onClick={handleConfirm} 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  disabled={!startingPoint.address || !destination.address}
                >
                  find reccomendations and eta
                </Button>
              </div>
            </div>
            
            {/* Right Column - Map and Nearby Places */}
            <div className="space-y-6 h-full flex flex-col">
              {/* Map Container */}
              <div className="relative flex-1 min-h-[300px] rounded-lg overflow-hidden border border-gray-200">
                {/* Transit Layer Indicator */}
                {isMetroMode && destination.address && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M184,24H72A32,32,0,0,0,40,56V184a32,32,0,0,0,32,32h8L65.6,235.2a8,8,0,1,0,12.8,9.6L100,216h56l21.6,28.8a8,8,0,1,0,12.8-9.6L176,216h8a32,32,0,0,0,32-32V56A32,32,0,0,0,184,24ZM56,120V80h64v40Zm80-40h64v40H136ZM72,40H184a16,16,0,0,1,16,16v8H56V56A16,16,0,0,1,72,40ZM184,200H72a16,16,0,0,1-16-16V136H200v48A16,16,0,0,1,184,200ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm88,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"></path>
                    </svg>
                    Transit Lines
                  </div>
                )}
                
                <div 
                  ref={mapRef} 
                  className="w-full h-full"
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Nearby Places Section - Removed to focus on two-place selection */}
            </div>
          </div>
          
          {/* Date/Time Picker Modal */}
          {showDateTimePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  When is your date?
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={selectedDateTime ? selectedDateTime.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        if (date) {
                          const newDate = new Date(date);
                          if (selectedDateTime) {
                            newDate.setHours(selectedDateTime.getHours());
                            newDate.setMinutes(selectedDateTime.getMinutes());
                          }
                          setSelectedDateTime(newDate);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      type="time"
                      value={selectedDateTime ? selectedDateTime.toTimeString().slice(0, 5) : ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (time && selectedDateTime) {
                          const [hours, minutes] = time.split(':').map(Number);
                          const newDate = new Date(selectedDateTime);
                          newDate.setHours(hours, minutes);
                          setSelectedDateTime(newDate);
                        } else if (time) {
                          const [hours, minutes] = time.split(':').map(Number);
                          const newDate = new Date();
                          newDate.setHours(hours, minutes);
                          setSelectedDateTime(newDate);
                      }
                    }}
                  />
                </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Your Date Plan:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📍 Start: {startingPoint.address}</div>
                      {waypoints.map((wp, i) => (
                        <div key={wp.id}>📍 Stop {i + 1}: {wp.name}</div>
                      ))}
                      <div>🎯 End: {destination.address}</div>
                      <div>🚇 Transport: {isMetroMode ? 'Metro' : 'Driving'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDateTimePicker(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  {checkingCalendarStatus ? (
                    <Button
                      disabled
                      className="flex-1 bg-gray-400 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Checking Calendar...
                    </Button>
                  ) : isCalendarConnected ? (
                    <Button
                      onClick={createCalendarEvent}
                      disabled={!selectedDateTime || isCreatingCalendarEvent}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {isCreatingCalendarEvent ? 'Adding to Calendar...' : 'Add to Calendar'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => window.location.href = '/sign-in'}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Sign in with Google
                    </Button>
              )}
            </div>
          </div>
            </div>
          )}
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => resetForm()}>
                Cancel
              </Button>
            </DrawerClose>
            <Button 
              onClick={handleConfirm} 
              disabled={!startingPoint.place || !destination.place}
            >
              Confirm Date
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
