"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react"
import { format, addMonths, subMonths, isToday, isSameDay } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer"

interface CalendarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  className?: string;
}

export function CalendarDrawer({ 
  open, 
  onOpenChange, 
  date, 
  onDateSelect,
  className 
}: CalendarDrawerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || new Date())
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    if (date) {
      setCurrentMonth(date)
      setTempDate(date)
    }
  }, [date])

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    setTempDate(newDate)
    onDateSelect(newDate)
    onOpenChange(false)
  }

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date)
  }

  const handleClear = () => {
    setTempDate(undefined)
    onDateSelect(undefined)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] overflow-hidden rounded-t-2xl">
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-semibold">
                {tempDate ? format(tempDate, 'MMMM d, yyyy') : 'Select a Date'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            {tempDate && (
              <p className="text-sm text-muted-foreground">
                {isToday(tempDate) ? 'Today' : format(tempDate, 'EEEE')}
              </p>
            )}
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMonthChange(subMonths(currentMonth, 1))}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-medium w-40 text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMonthChange(addMonths(currentMonth, 1))}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-full max-w-xs mx-auto">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={handleSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                className="w-full"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-2",
                  caption: "hidden",
                  caption_label: "hidden",
                  nav: "hidden",
                  table: "w-full border-collapse",
                  head_row: "w-full flex justify-between mb-1",
                  head_cell: "text-muted-foreground text-xs font-normal w-8 text-center",
                  row: "w-full flex justify-between my-1",
                  cell: "w-8 h-8 p-0 text-center text-sm",
                  day: cn(
                    "h-8 w-8 p-0 text-sm font-normal rounded-full flex items-center justify-center mx-auto",
                    "hover:bg-gray-100 dark:hover:bg-gray-800"
                  ),
                  day_today: "bg-gray-100 dark:bg-gray-800 font-semibold",
                  day_selected: cn(
                    "bg-gradient-to-br from-pink-500 to-rose-500 text-white",
                    "hover:from-pink-600 hover:to-rose-600 hover:text-white"
                  ),
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today && !isSameDay(date, today)
                }}
                initialFocus
              />
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-between gap-2">
            <Button 
              variant="ghost" 
              onClick={handleClear}
              disabled={!tempDate}
              className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            >
              Clear
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => tempDate && handleSelect(tempDate)}
                disabled={!tempDate}
                className="min-w-[100px] bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
