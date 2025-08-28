"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
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

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

interface DatePlan {
  startingPoint: string
  destination: string
  waypoints: string[]
  budget: string
  distance: string
}

interface DateDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  onConfirm: (plan: DatePlan) => void
  budget: string
  onBudgetChange: (value: string) => void
  distance: string
  onDistanceChange: (value: string) => void
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
  interface Location {
    lat: number;
    lng: number;
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

  const [startingPoint, setStartingPoint] = useState('')
  const [destination, setDestination] = useState('')
  const [waypoints, setWaypoints] = useState<string[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,directions`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
      return () => {
        document.head.removeChild(script)
      }
    } else {
      setMapLoaded(true)
    }
  }, [])

  // Initialize map when component mounts and Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
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
      })

      directionsService.current = new window.google.maps.DirectionsService()
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#ec4899',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
    }

    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null)
      }
    }
  }, [mapLoaded])

  // Update route when start/destination changes
  useEffect(() => {
    if (startingPoint && destination && directionsService.current && directionsRenderer.current) {
      directionsService.current.route(
        {
          origin: startingPoint,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          waypoints: waypoints.map(waypoint => ({
            location: waypoint,
            stopover: true
          })),
          optimizeWaypoints: true
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.current?.setDirections(result)
            
            // Fit the map to the bounds of the route
            const bounds = new window.google.maps.LatLngBounds()
            result.routes[0].legs.forEach(leg => {
              bounds.union(leg.start_location)
              bounds.union(leg.end_location)
            })
            mapInstance.current?.fitBounds(bounds)
          }
        }
      )
    }
  }, [startingPoint, destination, waypoints, mapLoaded])

  const handleAddWaypoint = (place: string) => {
    setWaypoints([...waypoints, place])
  }

  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = [...waypoints]
    newWaypoints.splice(index, 1)
    setWaypoints(newWaypoints)
  }

  const handleConfirm = () => {
    onConfirm({
      startingPoint,
      destination,
      waypoints,
      budget,
      distance
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <div className="flex flex-col h-full">
          <DrawerHeader>
            <div className="flex justify-between items-start w-full">
              <div>
                <DrawerTitle>Plan Your Date</DrawerTitle>
                <DrawerDescription>
                  {selectedDate && `Date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Starting Point</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <LocationSearch
                    onPlaceSelected={(place: Place) => {
                      if (place) {
                        const address = place.formatted_address || place.name || '';
                        setStartingPoint(address);
                        
                        if (place.geometry?.location) {
                          const latLng = {
                            lat: typeof place.geometry.location.lat === 'function' 
                              ? (place.geometry.location as any).lat()
                              : place.geometry.location.lat,
                            lng: typeof place.geometry.location.lng === 'function'
                              ? (place.geometry.location as any).lng()
                              : place.geometry.location.lng
                          };
                          
                          // Pan map to the selected location
                          if (mapInstance.current) {
                            mapInstance.current.setCenter(latLng);
                            mapInstance.current.setZoom(15);
                            
                            // Clear existing markers (optional, or manage them in state)
                            // Add a marker
                            new window.google.maps.Marker({
                              position: latLng,
                              map: mapInstance.current,
                              title: place.name || 'Starting Point',
                              label: 'A',
                              animation: window.google.maps.Animation.DROP,
                            });
                          }
                        }
                      }
                    }}
                    placeholder="Where are you starting from?"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <LocationSearch
                    onPlaceSelected={(place: Place) => {
                      if (place) {
                        const address = place.formatted_address || place.name || '';
                        setDestination(address);
                        
                        if (place.geometry?.location) {
                          const latLng = {
                            lat: typeof place.geometry.location.lat === 'function' 
                              ? (place.geometry.location as any).lat()
                              : place.geometry.location.lat,
                            lng: typeof place.geometry.location.lng === 'function'
                            ? (place.geometry.location as any).lng()
                            : place.geometry.location.lng
                        };
                        
                        // Pan map to the selected location
                        if (mapInstance.current) {
                          mapInstance.current.setCenter(latLng);
                          mapInstance.current.setZoom(15);
                          
                          // Clear existing markers (optional, or manage them in state)
                          // Add a marker
                          new window.google.maps.Marker({
                            position: latLng,
                            map: mapInstance.current,
                            title: place.name || 'Destination',
                            label: 'B',
                            animation: window.google.maps.Animation.DROP,
                          });
                        }
                      }
                    }
                  }}
                  placeholder="Where are you going?"
                />
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
              
              {waypoints.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Waypoints</label>
                  <div className="space-y-2">
                    {waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{waypoint}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRemoveWaypoint(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  onClick={handleConfirm} 
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  disabled={!startingPoint || !destination}
                >
                  find reccomendations and eta
                </Button>
              </div>
            </div>
            
            {/* Right Column - Map */}
            <div className="h-[400px] md:h-auto rounded-lg overflow-hidden border">
              <div ref={mapRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
