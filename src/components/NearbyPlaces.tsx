'use client';

import { useState, useEffect, useRef } from 'react';
import { Select, SelectItem, Button } from '@heroui/react';

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
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilter>(PLACE_FILTERS[0]);
  const placesService = useRef<any>(null);
  
  // Trigger search when filter changes  // Update places data when new results come in
  useEffect(() => {
    if (places.length > 0) {
      setSelectedPlaces(places.map(place => ({
        ...place,
        selected: false
      })));
    }
  }, [places]);

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
      className={`p-4 border rounded-lg transition-shadow ${
        place.selected ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={place.selected}
          onChange={() => togglePlaceSelection(place.place_id)}
          onClick={(e) => e.stopPropagation()}
          className="mr-2 mt-1"
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
          <div className="flex-shrink-0 ml-4">
            <img 
              src={place.photos[0].photo_reference} 
              alt={place.name}
              className="w-16 h-16 object-cover rounded"
            />
          </div>
        )}
      </div>
      {place.selected && place.geometry?.location && (
        <div className="mt-2 text-sm text-gray-500">
          Stop #{selectedPlaces.filter(p => p.selected).findIndex(p => p.place_id === place.place_id) + 1}
        </div>
      )}
    </div>
  );

  const togglePlaceSelection = (placeId: string) => {
    setSelectedPlaces(prev => 
      prev.map(place => 
        place.place_id === placeId 
          ? { ...place, selected: !place.selected } 
          : place
      )
    );
  };

  // Generate optimized route
  const generateOptimizedRoute = async () => {
    if (selectedPlaces.filter(p => p.selected).length < 2) {
      alert('Please select at least 2 places to generate a route');
      return;
    }

    try {
      setLoading(true);
      
      // Get the starting point (first selected place)
      const selectedPlacesList = selectedPlaces.filter(p => p.selected);
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
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRenderer = useRef<any>(null);

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
    };

    // Add marker for the destination
    if (location && mapInstance.current) {
      const position: Location = { 
        lat: location!.lat, 
        lng: location!.lng 
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
    }

    // Initialize places service
    if (mapInstance.current) {
      placesService.current = new window.google.maps.places.PlacesService(
        mapInstance.current
      );
    }

    // Search for nearby places
    findNearbyPlaces();

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [location]);

  const findNearbyPlaces = async () => {
    if (!placesService.current || !location) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching nearby places with filter:', selectedFilter);
      const response = await fetch('/api/nearby-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { lat: location.lat, lng: location.lng },
          radius: radius,
          keyword: selectedFilter.value,
          type: 'restaurant'
        }),
      });
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (response.ok) {
        setPlaces(data.places || []);
      } else {
        setError(data.error || 'Failed to fetch places');
      }

      // Clear any existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Add markers for each place
      data.places.forEach((place: any) => {
        if (place.geometry?.location) {
          const marker = new window.google.maps.Marker({
            position: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            map: mapInstance.current,
            title: place.name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });
          markersRef.current.push(marker);
        }
      });
      
      // Update the map bounds to show all markers
      if (data.places.length > 0 && mapInstance.current) {
        const bounds = new window.google.maps.LatLngBounds();
        data.places.forEach((place: any) => {
          if (place.geometry?.location) {
            bounds.extend({
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            });
          }
        });
        mapInstance.current.fitBounds(bounds);
      }
    } catch (err) {
      console.error('Error fetching places from API:', err);
      // Fallback to client-side search if API fails
    }

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

    placesService.current.nearbySearch(
      request,
      (results: any[], status: string) => {
        setLoading(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData = results.map((place: any) => ({
            place_id: place.place_id || '',
            name: place.name || 'Unnamed Place',
            formatted_address: place.vicinity || '',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            photos: place.photos?.map((photo: PlacePhoto) => ({
              photo_reference: photo.getUrl ? photo.getUrl({ maxWidth: 400 }) : ''
            })),
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
      }
    );
  };

  const updateMarkers = (placesData: PlaceResult[]) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!mapInstance.current) return;

    // Add new markers
    placesData.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstance.current,
        title: place.name,
        icon: {
          url: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add click listener to center map and show info window
      marker.addListener('click', () => {
        if (mapInstance.current) {
          mapInstance.current.setCenter(place.geometry.location);
          mapInstance.current.setZoom(17);
        }
      });

      markersRef.current.push(marker);
    });
  };

  if (!location) return null;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-medium">Nearby Places</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-48 relative z-10">
            <Select
              selectedKeys={[selectedFilter.value]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                const newFilter = PLACE_FILTERS.find(f => f.value === selectedKey) || PLACE_FILTERS[0];
                setSelectedFilter(newFilter);
              }}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              className="w-full bg-white rounded-md border border-gray-300"
              classNames={{
                trigger: 'h-10 px-3 py-2 text-sm text-left text-black',
                popoverContent: 'bg-white border border-gray-300 rounded-md shadow-lg',
                listbox: 'py-1',
              }}
              placeholder="Select a filter"
              aria-label="Filter places"
              variant="flat"
              size="sm"
            >
              {PLACE_FILTERS.map((filter) => (
                <SelectItem 
                  key={filter.value} 
                  className="px-3 py-2 text-sm text-black hover:bg-gray-100"
                >
                  {filter.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="relative">
            <Button 
              onPress={findNearbyPlaces}
              isLoading={loading}
              className="h-10 px-6 min-w-[120px] border-2 border-black bg-white text-black hover:bg-gray-50 transition-colors"
              variant="flat"
              size="md"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <div className="absolute inset-0 border-2 border-black rounded-md translate-x-1 translate-y-1 -z-10" />
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg overflow-hidden border border-gray-200"
      />

      {/* Places List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Nearby Places</h3>
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={generateOptimizedRoute}
              disabled={selectedPlaces.filter(p => p.selected).length < 2 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Generating...' : `Generate Route (${selectedPlaces.filter(p => p.selected).length} selected)`}
            </Button>
            
            {optimizedRoute && (
              <div className="text-sm bg-blue-50 p-2 rounded-md">
                <div className="font-medium text-blue-800">Route Summary:</div>
                <div className="flex justify-between mt-1">
                  <span className="text-blue-700">Total Distance:</span>
                  <span className="font-medium">
                    {optimizedRoute.routes[0].legs.reduce(
                      (total: number, leg: any) => total + (leg.distance?.value || 0),
                      0
                    ) / 1000} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Estimated Time:</span>
                  <span className="font-medium">
                    {Math.round(
                      optimizedRoute.routes[0].legs.reduce(
                        (total: number, leg: any) => total + (leg.duration?.value || 0),
                        0
                      ) / 60
                    )} mins
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!loading && places.length === 0 && !error ? (
          <p className="text-gray-500 text-center py-4">No {selectedFilter.label.toLowerCase()} places found nearby.</p>
        ) : (
          <div className="space-y-4">
            {places.map(place => {
              const isSelected = selectedPlaces.some(p => p.place_id === place.place_id);
              return (
                <div 
                  key={place.place_id}
                  className={`p-4 border rounded-lg transition-shadow ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePlaceSelection(place.place_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{place.name}</h4>
                      <p className="text-sm text-gray-600">{place.formatted_address}</p>
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
                      <div className="ml-4">
                        <img 
                          src={place.photos[0].photo_reference} 
                          alt={place.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
