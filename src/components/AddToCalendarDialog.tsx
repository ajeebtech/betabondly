"use client"

import { useState } from "react"
import { format, addHours, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AddToCalendarDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      toast.error("Please select a date")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const eventDate = new Date(date)
      eventDate.setHours(hours, minutes, 0, 0)
      
      // Validate time
      if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
        toast.error("Please enter a valid time")
        return
      }
      
      const formData = {
        title: (e.currentTarget as HTMLFormElement).eventTitle.value,
        date: eventDate,
        location: (e.currentTarget as HTMLFormElement).eventLocation.value,
        notes: (e.currentTarget as HTMLFormElement).eventNotes.value,
      }
      
      // Here you would typically make an API call to save the event
      console.log('Event created:', formData)
      
      // Show success message
      toast.success("Event added to calendar")
      
      // Reset form
      ;(e.target as HTMLFormElement).reset()
      setDate(new Date())
      setTime(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`)
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white transition-colors">
            <Plus className="h-4 w-4" />
            Add to Calendar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white border-black">
          <DialogHeader>
            <DialogTitle className="text-black">Add to Calendar</DialogTitle>
            <DialogDescription className="text-gray-700">
              Create a new calendar event. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-black font-medium">Event Title</Label>
              <Input 
                id="event-title" 
                name="eventTitle"
                placeholder="Enter event title" 
                className="border-gray-400 focus:border-black focus:ring-black h-10"
                required 
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date" className="text-black font-medium">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-400 h-10",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      weekStartsOn={1}
                      classNames={{
                        day_selected: "bg-black text-white hover:bg-black hover:text-white",
                        day_today: "border border-black",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-time" className="text-black font-medium">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="event-time" 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-9 border-gray-400 focus:border-black focus:ring-black h-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-location" className="text-black font-medium">Location (Optional)</Label>
              <Input 
                id="event-location"
                name="eventLocation"
                placeholder="Enter location"
                className="border-gray-400 focus:border-black focus:ring-black h-10"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-notes" className="text-black font-medium">Notes (Optional)</Label>
              <textarea 
                id="event-notes" 
                name="eventNotes"
                className="flex min-h-[100px] w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black focus:outline-none disabled:opacity-50"
                placeholder="Add any additional notes"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
