'use client';

import { useState, useEffect, useRef } from 'react';
import { Select, SelectItem, Button } from '@heroui/react';

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

interface NearbyPlacesProps {
  location: {
    lat: number;
    lng: number;
  } | null;
  radius?: number;
  onPlaceSelect?: (place: PlaceResult) => void;
}

export default function NearbyPlaces({ 
  location, 
  radius = 500, 
  onPlaceSelect 
}: NearbyPlacesProps) {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PlaceFilter>(PLACE_FILTERS[0]);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize map and places service
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
    new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
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
    placesService.current = new window.google.maps.places.PlacesService(
      mapInstance.current
    );

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

    // First, try to use the Places API directly
    try {
      const response = await fetch('/api/nearby-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { lat: location.lat, lng: location.lng },
          radius: radius,
          filter: selectedFilter.value
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      setPlaces(data.places || []);
      updateMarkers(data.places || []);
      setLoading(false);
      return;
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
      (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
        setLoading(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData = results.map(place => ({
            place_id: place.place_id || '',
            name: place.name || 'Unnamed Place',
            formatted_address: place.vicinity || '',
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            photos: place.photos?.map(photo => ({
              photo_reference: photo.getUrl({ maxWidth: 400 })
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

        {!loading && places.length === 0 && !error && (
          <p className="text-gray-500 text-center py-4">No vegetarian restaurants found nearby.</p>
        )}

        {places.map((place) => (
          <div 
            key={place.place_id} 
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onPlaceSelect?.(place)}
          >
            <div className="flex justify-between items-start">
              <div>
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
                        {Array(place.price_level).fill('$').join('')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {place.photos?.[0]?.photo_reference && (
                <div className="ml-4 flex-shrink-0">
                  <img 
                    src={place.photos[0].photo_reference} 
                    alt={place.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
