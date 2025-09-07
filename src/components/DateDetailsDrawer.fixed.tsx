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

// Dynamically import the NearbyPlaces component to avoid SSR issues with Google Maps
const NearbyPlaces = dynamic(() => import('@/components/NearbyPlaces'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
    </div>
  ),
});

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

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

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
    
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections(null);
    }
    
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Handle drawer state changes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
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
    
    resetForm();
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
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(15);
    }
  };

  // Handle removing a waypoint
  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

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
                    <Badge variant="outline" className="bg-green-100 text-green-700">
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
                <label className="block text-sm font-medium mb-1">Budget</label>
                <Select value={budget} onValueChange={onBudgetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - Budget Friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
                  </SelectContent>
                </Select>
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
                  onClick={handleSubmit} 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  disabled={!startingPoint.place || !destination.place}
                >
                  Find Recommendations and ETA
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
              {destination.place?.geometry?.location && (
                <div className="mt-4 border-t pt-4">
                  <NearbyPlaces
                    location={{
                      lat: typeof destination.place.geometry.location.lat === 'function'
                        ? destination.place.geometry.location.lat()
                        : destination.place.geometry.location.lat,
                      lng: typeof destination.place.geometry.location.lng === 'function'
                        ? destination.place.geometry.location.lng()
                        : destination.place.geometry.location.lng
                    }}
                    radius={500}
                    onPlaceSelect={(
                      result: { selectedPlaces: Place[]; route?: any }
                    ) => {
                      if (result.selectedPlaces.length > 0) {
                        const firstPlace = result.selectedPlaces[0];
                        if (mapInstance.current && firstPlace.geometry?.location) {
                          const location = firstPlace.geometry.location;
                          const lat =
                            typeof location.lat === 'function'
                              ? location.lat()
                              : location.lat;
                          const lng =
                            typeof location.lng === 'function'
                              ? location.lng()
                              : location.lng;
                          mapInstance.current.setCenter({ lat: Number(lat), lng: Number(lng) });
                          mapInstance.current.setZoom(17);
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DrawerClose>
            <Button 
              onClick={handleSubmit} 
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
