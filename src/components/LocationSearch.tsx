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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
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
  } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Add null checks for refs
  const getMap = () => {
    if (!mapRef.current) {
      console.error('Map not initialized');
      return null;
    }
    return mapRef.current;
  };
  
  const getSearchBox = () => {
    if (!searchBoxRef.current) {
      console.error('SearchBox not initialized');
      return null;
    }
    return searchBoxRef.current;
  };

  // Fix for Google Places dropdown z-index and styling
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .pac-container {
        z-index: 10000 !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        margin-top: 0.5rem !important;
        font-family: inherit !important;
      }
      .pac-item {
        padding: 0.75rem 1rem !important;
        cursor: pointer !important;
        border-top: 1px solid #e5e7eb !important;
        transition: background-color 0.2s !important;
      }
      .pac-item:first-child {
        border-top: none !important;
      }
      .pac-item:hover {
        background-color: #f9fafb !important;
      }
      .pac-item-query {
        font-size: 0.875rem !important;
        color: #111827 !important;
      }
      .pac-icon {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set up the global initMap function
      window.initMap = initializeAutocomplete;
      
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
      };
      
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      // Clean up event listeners
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (mapRef.current) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    // Create a hidden map (required for Autocomplete)
    const hiddenMapDiv = document.createElement('div');
    hiddenMapDiv.style.display = 'none';
    document.body.appendChild(hiddenMapDiv);

    // Create a map instance (required for Autocomplete)
    mapRef.current = new window.google.maps.Map(hiddenMapDiv, {
      center: { lat: 28.6139, lng: 77.209 }, // Default to New Delhi
      zoom: 13,
    });

    // Create the autocomplete and link it to the UI element
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' }
    });

    // Listen for the event fired when the user selects a prediction and retrieve more details for that place
    if (autocompleteRef.current) {
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
    }
  };

  const handlePlaceChanged = () => {
    try {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.geometry?.location) {
        console.log('No place selected or no geometry available');
        return;
      }

      // Create a simplified place object with only the properties we need
      const simplifiedPlace = {
        name: place.name || '',
        formatted_address: place.formatted_address || '',
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
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleInputClick = () => {
    // This function is intentionally left empty as we're using the input's ref
    // to initialize the autocomplete when it's focused
  };

  return (
    <div className={`space-y-4 ${className}`} style={{ position: 'relative', zIndex: 1 }}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onClick={handleInputClick}
          className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(54.5,60%,80%)] text-gray-900"
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
        <div className="mt-4 z-0">
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
