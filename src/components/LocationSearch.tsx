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
        background-color: white !important;
        pointer-events: auto !important;
      }
      
      /* Fix for dropdown click events */
      .pac-item {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      
      /* Prevent clicks from being intercepted */
      .pac-container:after {
        display: none !important;
      }
      
      .pac-item {
        padding: 0.75rem 1rem !important;
        cursor: pointer !important;
        border-top: 1px solid #e5e7eb !important;
        transition: background-color 0.2s !important;
        font-size: 0.875rem !important;
        color: #374151 !important;
        pointer-events: auto !important;
      }
      .pac-item:first-child {
        border-top: none !important;
      }
      .pac-item:hover {
        background-color: #f3f4f6 !important;
      }
      .pac-item-query {
        font-size: 0.875rem !important;
        color: #111827 !important;
        padding-right: 3px;
      }
      .pac-icon {
        display: none !important;
      }
      .pac-item:after {
        display: none !important;
      }
      .pac-matched {
        font-weight: 500 !important;
        color: #111827 !important;
      }
      
      /* Prevent clicks on the dropdown from being intercepted */
      .pac-container:after {
        content: none !important;
      }
      
      /* Fix for dropdown positioning */
      .pac-logo:after {
        display: none !important;
      }`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load Google Maps script with error handling
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        return;
      }

      // Remove any existing script with the same src to prevent duplicates
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.remove();
      }

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
    };

    loadGoogleMapsScript();

    return () => {
      // Clean up event listeners and global function
      if (window.google && window.google.maps && window.google.maps.event) {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
        if (mapRef.current) {
          window.google.maps.event.clearInstanceListeners(mapRef.current);
        }
      }
      window.initMap = undefined;
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      console.error('Input ref not available');
      return;
    }

    if (!window.google?.maps?.places) {
      console.error('Google Maps JavaScript API not fully loaded');
      return;
    }
    
    // Clean up any existing autocomplete instance
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    // Clean up any existing autocomplete instance
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      // Create a hidden map (required for Autocomplete)
      const hiddenMapDiv = document.createElement('div');
      hiddenMapDiv.style.display = 'none';
      document.body.appendChild(hiddenMapDiv);

      // Create a map instance (required for Autocomplete)
      mapRef.current = new window.google.maps.Map(hiddenMapDiv, {
        center: { lat: 28.6139, lng: 77.209 }, // Default to New Delhi
        zoom: 13,
      });

      // Create the autocomplete with more comprehensive configuration
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'in' },
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id', 'types'],
        }
      );

      // Prevent clicks on the dropdown from being intercepted
      document.addEventListener('click', (e) => {
        if (e.target && (e.target as HTMLElement).closest && 
            (e.target as HTMLElement).closest('.pac-container')) {
          e.stopPropagation();
        }
      }, true);

      // Add place_changed event listener with null check
      const autocomplete = autocompleteRef.current;
      if (autocomplete) {
        autocomplete.addListener('place_changed', () => {
          handlePlaceChanged();
        });
        
        // Prevent clicks on the dropdown from being intercepted
        window.google.maps.event.addDomListener(inputRef.current, 'keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' && document.activeElement === inputRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }

      // Handle click events on the input to show suggestions
      const handleInputClick = (e: MouseEvent) => {
        e.stopPropagation();
      };

      // Add click event listener to the input
      if (inputRef.current) {
        inputRef.current.addEventListener('click', handleInputClick);
      }

      // Clean up function
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('click', handleInputClick);
        }
        document.body.removeChild(hiddenMapDiv);
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  const handlePlaceChanged = () => {
    try {
      if (!autocompleteRef.current) {
        console.error('Autocomplete not initialized');
        return;
      }

      const place = autocompleteRef.current.getPlace();
      
      if (!place) {
        console.log('No place selected');
        return;
      }

      if (!place.geometry || !place.geometry.location) {
        console.log('No geometry available for the selected place');
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

      setSelectedPlace(simplifiedPlace);
      onPlaceSelected(simplifiedPlace);
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      // Trigger a small input change to show suggestions
      const inputEvent = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(inputEvent);
    }
  };

  return (
    <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onFocus={() => {
            if (inputRef.current) {
              inputRef.current.value = '';
              const event = new Event('input', { bubbles: true });
              inputRef.current.dispatchEvent(event);
            }
          }}
          className={`w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${className}`}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
      </div>
      {selectedPlace && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {selectedPlace.name || selectedPlace.formatted_address}
        </div>
      )}
    </div>
  );
}
