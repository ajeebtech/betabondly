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
import { DateDetailsDrawer } from "./DateDetailsDrawer"

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
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [open, setOpen] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(undefined)

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) return
    setTempDate(newDate)
    setDetailsOpen(true)
  }

  const handleConfirmDate = () => {
    if (!tempDate) return
    setSelectedDate(tempDate)
    onSelect?.(tempDate)
    setDetailsOpen(false)
    setOpen(false)
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  return (
    <Drawer open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setCurrentMonth(new Date());
        }
      }}>
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
      <DrawerContent className="bg-[hsl(54.5,91.7%,95.3%)] text-gray-900 border-0 h-[90vh] max-h-[800px] [&>div]:bg-[hsl(54.5,91.7%,95.3%)] [&>div]:rounded-t-2xl">
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
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border-0"
                classNames={{
                  months: "w-full min-h-[360px] flex justify-center",
                  month: "space-y-1 w-full flex flex-col h-full",
                  caption: "flex justify-center pt-1 relative items-center h-8 flex-shrink-0",
                  caption_label: "hidden",
                  nav: "w-full flex items-center justify-between absolute top-0 left-0",
                  nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-transparent hover:opacity-100",
                  nav_button_previous: "static ml-1",
                  nav_button_next: "static mr-1",
                  table: "w-full border-collapse space-y-1 flex-1",
                  head_row: "flex justify-between w-full mb-2",
                  head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2 justify-between flex-1",
                  cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-10 w-10 p-0 font-normal rounded-full transition-colors flex items-center justify-center",
                    "hover:bg-[hsl(54.5,60%,90%)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(54.5,60%,80%)]",
                    "aria-selected:bg-white aria-selected:text-black aria-selected:font-medium",
                    "text-gray-900",
                    "data-[today]:font-semibold data-[today]:text-gray-900",
                    "data-[today]:before:border-2 data-[today]:before:border-[hsl(54.5,60%,60%)]",
                    "data-[today][aria-selected]:before:border-black",
                    "data-[outside]:text-gray-400",
                    "data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none"
                  ),
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
      <DateDetailsDrawer 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        selectedDate={tempDate}
        onConfirm={handleConfirmDate}
      />
    </Drawer>
  )
}
