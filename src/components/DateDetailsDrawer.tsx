"use client"

import * as React from "react"
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface DateDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | undefined
  onConfirm: () => void
}

export function DateDetailsDrawer({ 
  open, 
  onOpenChange, 
  selectedDate,
  onConfirm
}: DateDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[hsl(54.5,91.7%,95.3%)] text-gray-900 border-0 h-[90vh] max-h-[800px] [&>div]:bg-[hsl(54.5,91.7%,95.3%)] [&>div]:rounded-t-2xl z-[100] fixed bottom-0 left-0 right-0">
        <div className="p-6 flex flex-col items-center w-full">
          <div className="w-full max-w-xs">
            <DrawerHeader className="p-0 mb-4">
              <DrawerTitle className="text-xl font-bold text-center">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="min-h-[360px] flex flex-col h-full">
              <div>
                <h3 className="text-lg font-bold mb-3 text-center">Name one place you want to go</h3>
                <div className="relative mb-6">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search for places or activities..."
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(54.5,60%,80%)]"
                  />
                </div>
              </div>
              
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
