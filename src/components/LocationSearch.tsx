'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

interface LocationSearchProps {
  onPlaceSelected: (place: {
    name?: string;
    formatted_address?: string;
    geometry?: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id?: string;
    types?: string[];
  }) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ onPlaceSelected, placeholder = 'Search for places...', className = '' }: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    name?: string;
    formatted_address?: string;
    geometry?: {
      location: {
        lat: () => number;
        lng: () => number;
      };
    };
    place_id?: string;
    types?: string[];
  } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set up the global initMap function
      window.initMap = initializeSearchBox;
      
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
      };
      
      document.head.appendChild(script);
    } else {
      initializeSearchBox();
    }

    return () => {
      // Clean up event listeners
      if (searchBoxRef.current) {
        window.google.maps.event.clearInstanceListeners(searchBoxRef.current);
      }
      if (mapRef.current) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
      }
    };
  }, []);

  const initializeSearchBox = () => {
    if (!inputRef.current) return;

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    // Create a hidden map (required for SearchBox)
    const hiddenMapDiv = document.createElement('div');
    hiddenMapDiv.style.display = 'none';
    document.body.appendChild(hiddenMapDiv);

    // Create a map instance (required for SearchBox)
    mapRef.current = new window.google.maps.Map(hiddenMapDiv, {
      center: { lat: 28.6139, lng: 77.209 }, // Default to New Delhi
      zoom: 13,
    });

    // Create the search box and link it to the UI element
    searchBoxRef.current = new window.google.maps.places.SearchBox(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' }
    });

    // Bias the SearchBox results towards current map's viewport
    mapRef.current.addListener('bounds_changed', () => {
      if (searchBoxRef.current) {
        searchBoxRef.current.setBounds(mapRef.current?.getBounds() as google.maps.LatLngBounds);
      }
    });

    // Listen for the event fired when the user selects a prediction and retrieve more details for that place
    searchBoxRef.current.addListener('places_changed', () => {
      const places = searchBoxRef.current?.getPlaces();
      
      if (!places || places.length === 0 || !places[0]) {
        return;
      }

      // For now, we'll just take the first place
      const place = places[0];
      
      if (!place.geometry || !place.geometry.location) {
        console.log('Returned place contains no geometry');
        return;
      }

      // Update the map to show the selected location
      if (mapContainerRef.current && place.geometry?.location) {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: place.geometry.location,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });

        new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        });

        setMap(map);
        setSelectedPlace(place);
      }

      // Transform the place data to a simpler format
      const simplifiedPlace = {
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        },
        place_id: place.place_id,
        types: place.types
      };

      onPlaceSelected(simplifiedPlace);
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(54.5,60%,80%)]"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      
      {selectedPlace && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {selectedPlace.name}
          </div>
          <div 
            ref={mapContainerRef} 
            className="w-full h-48 rounded-lg overflow-hidden border border-gray-200"
            style={{ minHeight: '200px' }}
          />
          <p className="mt-2 text-sm text-gray-500">
            {selectedPlace.formatted_address}
          </p>
        </div>
      )}
    </div>
  );
}
