"use client"

import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

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

interface DateDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  onConfirm: () => void
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white">
        <div className="w-full p-6 bg-white max-w-2xl mx-auto">
          <DrawerHeader className="px-0">
            <DrawerTitle>Plan a Date</DrawerTitle>
            <DrawerDescription>
              Add details for your date on {selectedDate && format(selectedDate, 'PPP')}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-center">Name one place you want to go</h3>
              <LocationSearch
                placeholder="Search for places or activities..."
                onPlaceSelected={(place) => {
                  console.log('Selected place:', place);
                  setSelectedPlace(place);
                  // You can also pass this to a parent component or form state
                }}
              />
              {selectedPlace && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedPlace.name}</p>
                  <p className="text-sm text-gray-600">{selectedPlace.formatted_address}</p>
                  {selectedPlace.geometry?.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      Location: {selectedPlace.geometry.location.lat.toFixed(6)}, {selectedPlace.geometry.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">How much do you want to spend?</label>
              <Select value={budget} onValueChange={onBudgetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">₹ - Budget-friendly</SelectItem>
                  <SelectItem value="$$">₹₹ - Moderate</SelectItem>
                  <SelectItem value="$$$">₹₹₹ - Expensive</SelectItem>
                  <SelectItem value="$$$$">₹₹₹₹ - Very expensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Search radius</label>
              <Select value={distance} onValueChange={onDistanceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select search radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="3">3 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="15">15 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-h-[200px] flex flex-col h-full">
              <div className="mt-auto pt-4 mb-12">
                <div className="flex gap-4">
                  <Button 
                    onClick={onConfirm}
                    className="flex-1 bg-[hsl(54.5,60%,80%)] hover:bg-[hsl(54.5,60%,75%)] text-gray-900 py-3 text-base font-medium"
                  >
                    Confirm
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1 py-3 text-base font-medium">
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
