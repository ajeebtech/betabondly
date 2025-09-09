'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Add global styles for checkboxes
const checkboxStyles = `
  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #9CA3AF;
    border-radius: 0.25rem;
    margin-right: 0.5rem;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
  }
  
  input[type="checkbox"]:checked {
    background-color: #3B82F6;
    border-color: #3B82F6;
  }
  
  input[type="checkbox"]:checked::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  input[type="checkbox"]:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

// Minimal type declarations for Google Maps
type GoogleMaps = {
  maps: {
    Map: any;
    Marker: any;
    places: {
      PlacesService: any;
      PlacesServiceStatus: any;
    };
    event: any;
    LatLng: any;
  };
};

// Extend the Window interface to include Google Maps
declare global {
  interface Window {
    google: any; // Using any to avoid complex type definitions
    initMap?: () => void;
  }
}

// Minimal type for place photos
type PlacePhoto = {
  getUrl: (options: { maxWidth: number }) => string;
};

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{ photo_reference: string }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
}

type PlaceFilter = {
  key: string;
  label: string;
  value: string;
};

const PLACE_FILTERS: PlaceFilter[] = [
  { key: 'servesVegetarianFood', label: 'Vegetarian', value: 'vegetarian' },
  { key: 'servesCoffee', label: 'Coffee Shop', value: 'coffee' },
  { key: 'servesBeer', label: 'Brewery/Bar', value: 'bar' },
  { key: 'takeout', label: 'Takeout Available', value: 'takeout' },
];

interface Location {
  lat: number;
  lng: number;
}

interface NearbyPlacesProps {
  location: Location | null;
  radius?: number;
  onPlaceSelect: (result: { selectedPlaces: PlaceResult[]; route: any }) => void;
}

interface SelectedPlace extends PlaceResult {
  selected: boolean;
}

export default function NearbyPlaces({ 
  location, 
  radius = 500, 
  onPlaceSelect 
}: NearbyPlacesProps) {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilter>(PLACE_FILTERS[0]);
  
  // Trigger search when filter changes or when component mounts
  useEffect(() => {
    if (location) {
      findNearbyPlaces((places) => {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        if (!mapInstance.current) return;
        
        // Add new markers
        places.forEach(place => {
          if (place.geometry?.location) {
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: mapInstance.current,
              title: place.name
            });
            markersRef.current.push(marker);
          }
        });
      });
    }
  }, [selectedFilter, location]);

  // Toggle place selection
  const togglePlaceSelection = (placeId: string) => {
    setSelectedPlaceIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(placeId)) {
        newSelection.delete(placeId);
      } else {
        newSelection.add(placeId);
      }
      
      // Call the parent callback with the updated selection
      const selectedPlaces = places.filter(p => newSelection.has(p.place_id));
      onPlaceSelect({
        selectedPlaces,
        route: null
      });
      
      return newSelection;
    });
  };

  // Add styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = checkboxStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render place item with selection
  const renderPlaceItem = (place: SelectedPlace) => (
    <div 
      key={place.place_id} 
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        selectedPlaceIds.has(place.place_id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => togglePlaceSelection(place.place_id)}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={selectedPlaceIds.has(place.place_id)}
          onChange={(e) => {
            e.stopPropagation();
            togglePlaceSelection(place.place_id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1 mt-0.5">
          <h4 className="font-medium text-gray-900">{place.name}</h4>
          <p className="text-sm text-gray-600 mt-0.5">{place.formatted_address}</p>
          {place.rating && (
            <div className="flex items-center mt-1">
              <span className="text-yellow-500">★ {place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-xs text-gray-500 ml-1">
                  ({place.user_ratings_total})
                </span>
              )}
              {place.price_level && (
                <span className="ml-2 text-sm text-gray-600">
                  {'$'.repeat(place.price_level)}
                </span>
              )}
            </div>
          )}
        </div>
        {place.photos?.[0]?.photo_reference && (
          <div className="ml-4 flex-shrink-0">
            <img 
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
              alt={place.name}
              className="w-16 h-16 object-cover rounded"
            />
          </div>
        )}
      </div>
      {selectedPlaceIds.has(place.place_id) && place.geometry?.location && (
        <div className="mt-2 text-sm text-gray-500">
          Stop #{Array.from(selectedPlaceIds).indexOf(place.place_id) + 1}
        </div>
      )}
    </div>
  );

  // Generate optimized route
  const generateOptimizedRoute = async () => {
    if (selectedPlaceIds.size < 2) {
      alert('Please select at least 2 places to generate a route');
      return;
    }

    try {
      setLoading(true);
      
      // Get the starting point (first selected place)
      const selectedPlacesList = places.filter(p => selectedPlaceIds.has(p.place_id));
      const waypoints = selectedPlacesList.map(place => ({
        location: new window.google.maps.LatLng(
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        stopover: true
      }));

      // Create a directions service
      const directionsService = new window.google.maps.DirectionsService();
      
      // Request directions
      const result = await directionsService.route({
        origin: waypoints[0].location,
        destination: waypoints[waypoints.length - 1].location,
        waypoints: waypoints.slice(1, -1),
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        avoidFerries: true,
        avoidHighways: false,
        avoidTolls: false,
      });

      // Display the route on the map
      if (directionsRenderer.current) {
        directionsRenderer.current.setDirections(result);
        
        // Adjust the map bounds to show the entire route
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach((leg: any) => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        
        if (mapInstance.current) {
          mapInstance.current.fitBounds(bounds, {
            top: 50, right: 50, bottom: 50, left: 50
          });
        }
      }

      setOptimizedRoute(result);
      
      // Pass the optimized route to the parent component
      if (onPlaceSelect) {
        onPlaceSelect({
          route: result,
          selectedPlaces: selectedPlacesList
        });
      }
    } catch (err) {
      console.error('Error generating route:', err);
      alert('Failed to generate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize map, directions renderer, and places service
  useEffect(() => {
    if (!location || !mapRef.current) return;

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: location.lat, lng: location.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    
    // Add marker for the destination
    const position = { 
      lat: location.lat, 
      lng: location.lng 
    };
    new window.google.maps.Marker({
      position,
      map: mapInstance.current,
      title: 'Destination',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff'
      }
    });
    
    // Initialize places service
    placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance.current);
    
    // Function to update markers on the map
    const updateMarkers = (places: any[]) => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      if (!mapInstance.current) return;
      
      // Add new markers
      places.forEach(place => {
        if (place.geometry?.location) {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstance.current,
            title: place.name
          });
          markersRef.current.push(marker);
        }
      });
    };
    
    // Initial search
    findNearbyPlaces((places) => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      if (!mapInstance.current) return;
      
      // Add new markers
      places.forEach(place => {
        if (place.geometry?.location) {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstance.current,
            title: place.name
          });
          markersRef.current.push(marker);
        }
      });
    });

    // Initialize directions renderer
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      },
      markerOptions: {
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      }
    });

    // Cleanup
    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
      // Clean up markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [location]);

  const findNearbyPlaces = async (updateMarkers: (places: any[]) => void) => {
    if (!window.google?.maps?.places || !location) {
      console.error('Google Maps not loaded');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // ... rest of your code remains the same ...

      // Fallback to client-side search
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        type: 'restaurant',
        keyword: selectedFilter.value,
        fields: [
          'name',
          'geometry',
          'formatted_address',
          'rating',
          'user_ratings_total',
          'price_level',
          'photos',
          ...PLACE_FILTERS.map(filter => filter.key)
        ],
      };

      placesServiceRef.current?.nearbySearch(request, (results, status) => {
        setLoading(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData = results.map((place: google.maps.places.PlaceResult) => ({
            place_id: place.place_id || '',
            name: place.name || 'Unnamed Place',
            formatted_address: place.vicinity || '',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            photos: place.photos?.map((photo: google.maps.places.PlacePhoto) => ({
              photo_reference: photo.getUrl ? photo.getUrl({ maxWidth: 400 }) : ''
            })) || [],
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            },
            types: place.types
          }));

          setPlaces(placesData);
          updateMarkers(placesData);
        } else {
          setError('Failed to load nearby places. Please try again.');
        }
      });
    } catch (err) {
      console.error('Error fetching places from API:', err);
      setError('Failed to load nearby places. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nearby Places</h3>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedFilter.value}
            onValueChange={(value) => {
              const filter = PLACE_FILTERS.find(f => f.value === value);
              if (filter) setSelectedFilter(filter);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {PLACE_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Places list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : places.length > 0 ? (
          places.map((place) => (
            <div 
              key={place.place_id} 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedPlaceIds.has(place.place_id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => togglePlaceSelection(place.place_id)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`place-${place.place_id}`}
                    name={`place-${place.place_id}`}
                    type="checkbox"
                    checked={selectedPlaceIds.has(place.place_id)}
                    onChange={() => togglePlaceSelection(place.place_id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 mt-0.5">
                  <h4 className="font-medium text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{place.formatted_address}</p>
                  {place.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★ {place.rating}</span>
                      {place.user_ratings_total && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({place.user_ratings_total})
                        </span>
                      )}
                      {place.price_level && (
                        <span className="ml-2 text-sm text-gray-600">
                          {'$'.repeat(place.price_level)}
                        </span>
                      )}
                    </div>
                  )}
                  {optimizedRoute?.routes?.[0]?.legs && (
                    <div className="mt-2 text-sm text-blue-700">
                      Estimated Time: {Math.round(
                        optimizedRoute.routes[0].legs.reduce(
                          (total: number, leg: any) => total + (leg.duration?.value || 0),
                          0
                        ) / 60
                      )} mins
                    </div>
                  )}
                </div>
                {place.photos?.[0]?.photo_reference && (
                  <div className="ml-4 flex-shrink-0">
                    <img 
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
                      alt={place.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-4">No places found</div>
        )}
      </div>
      
      {/* Map container */}
      <div ref={mapRef} className="h-64 w-full rounded-lg overflow-hidden" />
    </div>
  );
}
