'use client';

import { useEffect, useRef, useState } from 'react';

// Define types for Google Maps objects
interface GoogleLatLngLiteral {
  lat: number;
  lng: number;
}

interface GoogleLatLng {
  lat(): number;
  lng(): number;
  // Add other methods that might be needed
  toJSON(): GoogleLatLngLiteral;
}

interface Place {
  name?: string;
  formatted_address?: string;
  geometry?: {
    location: GoogleLatLng | GoogleLatLngLiteral;
  };
  place_id?: string;
  types?: string[];
}

interface SimplifiedPlace {
  name: string;
  formatted_address: string;
  geometry: {
    location: GoogleLatLngLiteral;
  };
  place_id?: string;
  types?: string[];
}

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

export function LocationSearch({ 
  onPlaceSelected, 
  placeholder = 'Search for places...', 
  className = '',
  value = ''
}: LocationSearchProps & { value?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [selectedPlace, setSelectedPlace] = useState<SimplifiedPlace | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Helper function to get coordinates from a LatLng or LatLngLiteral
  const getCoordinates = (location: GoogleLatLng | GoogleLatLngLiteral | undefined | null): GoogleLatLngLiteral => {
    if (!location) return { lat: 0, lng: 0 };
    
    try {
      if ('lat' in location) {
        const lat = typeof location.lat === 'function' ? (location as GoogleLatLng).lat() : location.lat;
        const lng = typeof location.lng === 'function' ? (location as GoogleLatLng).lng() : location.lng;
        return { lat, lng };
      }
      
      const latLng = location as google.maps.LatLng;
      if (latLng && typeof latLng.lat === 'function' && typeof latLng.lng === 'function') {
        return { lat: latLng.lat(), lng: latLng.lng() };
      }
      
      console.error('Invalid location object:', location);
      return { lat: 0, lng: 0 };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return { lat: 0, lng: 0 };
    }
  };

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

      // Add place_changed event listener with null check
      const autocomplete = autocompleteRef.current;
      if (autocomplete) {
        // Add the place_changed event listener
        autocomplete.addListener('place_changed', () => {
          handlePlaceChanged();
        });
        
        // Handle Enter key press
        window.google.maps.event.addDomListener(inputRef.current, 'keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' && document.activeElement === inputRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
        
        // Handle click events on the dropdown items
        const handleDocumentClick = (e: Event) => {
          const target = e.target as HTMLElement;
          const pacItem = target.closest('.pac-item');
          if (pacItem) {
            // Small delay to ensure the place is selected
            setTimeout(() => {
              handlePlaceChanged();
            }, 50);
          }
        };
        
        // Add a small delay to ensure the pac-container is in the DOM
        const setupClickHandler = () => {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            // Use capture phase to ensure we catch the event
            document.addEventListener('click', handleDocumentClick, { capture: true });
            return true;
          }
          return false;
        };
        
        // Try to set up immediately, then retry if needed
        if (!setupClickHandler()) {
          const interval = setInterval(() => {
            if (setupClickHandler()) {
              clearInterval(interval);
            }
          }, 100);
        }
        
        // Clean up the event listener
        return () => {
          document.removeEventListener('click', handleDocumentClick, { capture: true });
        };
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

      // Get the place details from the autocomplete
      const place = autocompleteRef.current.getPlace();
      
      if (!place) {
        console.log('No place selected');
        return;
      }

      console.log('Selected place:', place);

      // If we don't have geometry, try to get it using the place_id
      if (!place.geometry?.location) {
        console.log('No geometry available, trying to fetch place details...');
        
        if (!place.place_id) {
          console.error('No place_id available to fetch details');
          return;
        }

        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({ 
          placeId: place.place_id, 
          fields: ['geometry', 'formatted_address', 'name', 'place_id', 'types'] 
        }, (details: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === 'OK' && details?.geometry?.location) {
            const location = getCoordinates(details.geometry.location);
            const simplifiedPlace: SimplifiedPlace = {
              name: details.name || '',
              formatted_address: details.formatted_address || '',
              geometry: { location },
              place_id: details.place_id,
              types: details.types
            };
            
            setInputValue(details.formatted_address || details.name || '');
            setSelectedPlace(simplifiedPlace);
            onPlaceSelected(simplifiedPlace);
          } else {
            console.error('Error fetching place details:', status);
          }
        });
        return;
      }

      // If we have geometry, proceed normally
      const location = getCoordinates(place.geometry.location);
      const simplifiedPlace: SimplifiedPlace = {
        name: place.name || '',
        formatted_address: place.formatted_address || '',
        geometry: { location },
        place_id: place.place_id,
        types: place.types
      };

      setInputValue(place.formatted_address || place.name || '');
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

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click events on the dropdown items
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pac-container')) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // Use capture phase to catch the event early
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  return (
    <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
          className={`w-full rounded-md border border-gray-300 pl-10 pr-8 py-2 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 ${className}`}
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
