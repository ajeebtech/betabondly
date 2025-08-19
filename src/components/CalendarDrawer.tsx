"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface CalendarDrawerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  triggerLabel?: string
  className?: string
}

export function CalendarDrawer({
  date,
  onSelect,
  triggerLabel = "plan a date!",
  className,
}: CalendarDrawerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || new Date())
  const [open, setOpen] = React.useState(false)

  const handleSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
    onSelect?.(newDate)
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className={cn("inline-flex items-center justify-center", className)}>
          <Button 
            className="px-6 py-6 text-base font-medium rounded-full bg-[hsl(54.5,60%,80%)] hover:bg-[hsl(54.5,60%,75%)] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            {triggerLabel}
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-[hsl(54.5,91.7%,95.3%)] text-gray-900 border-0 [&>div]:bg-[hsl(54.5,91.7%,95.3%)] [&>div]:rounded-t-2xl">
        <div className="p-6 flex flex-col items-center">
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-[hsl(54.5,60%,90%)] text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-[hsl(54.5,60%,90%)] text-gray-900"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full bg-transparent text-gray-900 border-0"
                classNames={{
                  day: cn(
                    'h-10 w-10 p-0 font-normal rounded-full transition-colors flex items-center justify-center',
                    'hover:bg-[hsl(54.5,60%,90%)] focus:outline-none',
                    'aria-selected:bg-[hsl(54.5,60%,80%)] aria-selected:text-gray-900',
                    'text-gray-900',
                    'relative',
                    'before:absolute before:inset-0 before:rounded-full',
                    'hover:before:bg-[hsl(54.5,60%,90%)]',
                    'aria-selected:before:bg-[hsl(54.5,60%,80%)]',
                    'data-[today]:before:border data-[today]:before:border-[hsl(54.5,60%,60%)]',
                    'data-[today]:font-semibold',
                    'data-[today]:text-gray-900',
                    'data-[today][aria-selected]:text-gray-900',
                    'data-[today][aria-selected]:before:border-[hsl(54.5,60%,60%)]',
                    'data-[outside]:text-gray-500',
                    'data-[disabled]:text-gray-400',
                    'data-[disabled]:hover:bg-transparent',
                    'data-[disabled]:cursor-not-allowed',
                  ),
                  head_cell: 'text-gray-600 text-xs font-normal',
                  caption: 'hidden',
                  nav: 'hidden',
                  row: 'gap-1',
                  cell: 'h-10 w-10 p-0',
                }}
                formatters={{
                  formatDay: (date) => {
                    const day = date.getDate()
                    return day.toString()
                  },
                }}
              />
            </div>
            
            <div className="mt-6 flex justify-center w-full">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="mr-2 border-gray-400 text-gray-800 hover:bg-gray-100 w-24"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedDate) {
                    onSelect?.(selectedDate);
                  }
                  setOpen(false);
                }}
                className="bg-[hsl(54.5,60%,80%)] text-gray-900 hover:bg-[hsl(54.5,60%,75%)] w-24"
                disabled={!selectedDate}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
