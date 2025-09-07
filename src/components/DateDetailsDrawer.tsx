"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { format } from "date-fns"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { X, MapPin, Plus, Trash2 } from "lucide-react"
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
import dynamic from 'next/dynamic';

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
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
    </div>
  ),
});


// Extend the global Window interface
declare global {
  interface Window {
    google: any; // Using any to avoid complex type definitions
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

interface DatePlan {
  startingPoint: string;
  destination: string;
  waypoints: string[];
  budget: string;
  distance: string;
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
  
  const [startingPoint, setStartingPoint] = useState<LocationPoint>({ address: '', place: null });
  const [destination, setDestination] = useState<LocationPoint>({ address: '', place: null });
  const [waypoints, setWaypoints] = useState<LocationPoint[]>([]);
  
  // Reset all form fields
  const resetForm = () => {
    setStartingPoint({ address: '', place: null });
    setDestination({ address: '', place: null });
    setWaypoints([]);
    onBudgetChange('');
    onDistanceChange('');
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    
    // Clear the map
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections(null);
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
  
  // Get destination coordinates for nearby places
  const destinationCoords = useMemo(() => {
    if (!destination.place?.geometry?.location) return null;
    
    const loc = destination.place.geometry.location;
    return {
      lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
      lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
    };
  }, [destination.place]);

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
      
      const waypointList = waypoints
        .filter(wp => wp.address)
        .map(wp => ({
          location: wp.place?.formatted_address || wp.address,
          stopover: true
        }));
      
      directionsService.current.route(
        {
          origin,
          destination: dest,
          waypoints: waypointList,
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
  }, [startingPoint, destination, waypoints, mapLoaded]);

  // Handle adding a waypoint
  const handleAddWaypoint = (place: Place) => {
    setWaypoints([...waypoints, { address: place.formatted_address || place.name || '', place }]);
  };

  // Handle removing a waypoint
  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  // Handle confirming the date plan
  const handleConfirm = () => {
    if (!startingPoint.address || !destination.address) {
      setErrorMessage('Please set both starting point and destination');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    onConfirm({
      startingPoint: startingPoint.address,
      destination: destination.address,
      waypoints: waypoints.map(wp => wp.address),
      budget,
      distance
    });
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
            waypoints: waypoints.map(waypoint => ({
              location: waypoint.place?.formatted_address || waypoint.address,
              stopover: true
            })),
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
  }, [startingPoint, destination, waypoints, mapLoaded, open]);

  // Prevent clicks inside the drawer content from closing it
  const handleDrawerContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const resetDrawer = () => {
    setStartingPoint({ address: '', place: null });
    setDestination({ address: '', place: null });
    setWaypoints([]);
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
    
    onConfirm({
      startingPoint: startingPoint.address,
      destination: destination.address,
      waypoints: waypoints.map(wp => wp.address),
      budget,
      distance
    });
    
    // Reset form after submission
    resetForm();
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
              
              <div>
                <label className="block text-sm font-medium mb-1">Distance (km)</label>
                <Input 
                  type="number" 
                  value={distance} 
                  onChange={(e) => onDistanceChange(e.target.value)}
                  min="1"
                  max="50"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Waypoints</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const newWaypoint = {
                        address: '',
                        place: null
                      };
                      setWaypoints([...waypoints, newWaypoint]);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Stop
                  </Button>
                </div>
                
                {waypoints.length > 0 && (
                  <div className="space-y-2">
                    {waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <LocationSearch
                            onPlaceSelected={(place) => {
                              const updatedWaypoints = [...waypoints];
                              updatedWaypoints[index] = {
                                address: place?.formatted_address || place?.name || '',
                                place: place || null
                              };
                              setWaypoints(updatedWaypoints);
                            }}
                            placeholder={`Stop ${index + 1}`}
                            value={waypoint.address}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveWaypoint(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
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
              
              {/* Nearby Places Section */}
              {destinationCoords && (
                <div className="mt-4 border-t pt-4">
                  <NearbyPlaces 
                    location={destinationCoords} 
                    radius={500}
                    onPlaceSelect={(result) => {
                      // Handle the optimized route
                      if (result.selectedPlaces.length > 0) {
                        const firstPlace = result.selectedPlaces[0];
                        if (mapInstance.current && firstPlace.geometry?.location) {
                          mapInstance.current.setCenter({
                            lat: firstPlace.geometry.location.lat,
                            lng: firstPlace.geometry.location.lng
                          });
                          mapInstance.current.setZoom(15);
                        }
                        
                        // Here you can also handle the route visualization
                        // using result.route which contains the optimized route
                        console.log('Optimized route:', result.route);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
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
