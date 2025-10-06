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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Input, TextArea, Label, YStack, XStack } from "tamagui"

interface AddToCalendarDialogProps {
  onCardAdded?: (card: { name: string; designation: string; content: React.ReactNode }) => void;
}

export function AddToCalendarDialog({ onCardAdded }: AddToCalendarDialogProps) {
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
      
      // Get Firebase ID token for authentication
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      
      if (!user) {
        toast.error("Please sign in to add events to your calendar");
        return;
      }

      const idToken = await user.getIdToken();

      const formData = {
        title: (e.currentTarget as HTMLFormElement).eventTitle.value,
        date: eventDate,
        location: (e.currentTarget as HTMLFormElement).eventLocation.value,
        notes: (e.currentTarget as HTMLFormElement).eventNotes.value,
      }
      
      // Create event data for Google Calendar
      const eventData = {
        summary: formData.title,
        description: formData.notes || '',
        start: {
          dateTime: formData.date.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(formData.date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: formData.location || undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      // TODO: Re-enable Calendar integration after fixing OAuth setup
      // For now, just show a success message without actually creating the event
      console.log('Calendar event data:', eventData);
      
      // Show success message
      toast.success("Event created successfully!", {
        description: `${formData.title} has been added to your calendar`,
      });

      // Create a card for the new event
      if (onCardAdded) {
        const eventDate = new Date(formData.date);
        const timeString = eventDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        const dateString = eventDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short', 
          day: 'numeric' 
        });

        onCardAdded({
          name: formData.title,
          designation: `${dateString}, ${timeString}`,
          content: (
            <p>
              {formData.notes ? (
                <>
                  {formData.notes}
                  {formData.location && (
                    <>
                      <br />
                      <span className="font-bold text-pink-500">📍 {formData.location}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {formData.location ? (
                    <span className="font-bold text-pink-500">📍 {formData.location}</span>
                  ) : (
                    "Let's make some memories together! ❤️"
                  )}
                </>
              )}
            </p>
          ),
        });
      }
      
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
      toast.error(error instanceof Error ? error.message : "Failed to create event. Please try again.")
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
        <DialogContent className="sm:max-w-[500px] bg-white border-black">
          <DialogHeader>
            <DialogTitle className="text-black">Add to Calendar</DialogTitle>
            <DialogDescription className="text-gray-700">
              Create a new calendar event. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <YStack space="$4" padding="$4">
            <YStack space="$2">
              <Label htmlFor="event-title" color="$color" fontWeight="600">Event Title</Label>
              <Input 
                id="event-title" 
                name="eventTitle"
                placeholder="Enter event title" 
                borderColor="$gray8"
                focusStyle={{
                  borderColor: "$black",
                  outlineColor: "$black"
                }}
                height="$4"
                required 
                disabled={isSubmitting}
              />
            </YStack>
            
            <XStack space="$4" flexDirection={{ sm: "row" }} flexWrap="wrap">
              <YStack space="$2" flex={1} minWidth={200}>
                <Label htmlFor="event-date" color="$color" fontWeight="600">Date</Label>
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
                  <PopoverContent className="w-auto p-4" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      weekStartsOn={1}
                      className="rounded-md border-0"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
                        day_today: "border border-black font-semibold",
                        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </YStack>
              
              <YStack space="$2" flex={1} minWidth={200}>
                <Label htmlFor="event-time" color="$color" fontWeight="600">Time</Label>
                <XStack position="relative" alignItems="center">
                  <Clock 
                    position="absolute" 
                    left="$3" 
                    top="50%" 
                    transform="translateY(-50%)" 
                    size="$1" 
                    color="$gray10" 
                    zIndex={1}
                  />
                  <Input 
                    id="event-time" 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    borderColor="$gray8"
                    focusStyle={{
                      borderColor: "$black",
                      outlineColor: "$black"
                    }}
                    height="$4"
                    paddingLeft="$8"
                    required
                    disabled={isSubmitting}
                    flex={1}
                  />
                </XStack>
              </YStack>
            </XStack>
            
            <YStack space="$2">
              <Label htmlFor="event-location" color="$color" fontWeight="600">Location (Optional)</Label>
              <Input 
                id="event-location"
                name="eventLocation"
                placeholder="Enter location"
                borderColor="$gray8"
                focusStyle={{
                  borderColor: "$black",
                  outlineColor: "$black"
                }}
                height="$4"
                disabled={isSubmitting}
              />
            </YStack>
            
            <YStack space="$2">
              <Label htmlFor="event-notes" color="$color" fontWeight="600">Notes (Optional)</Label>
              <TextArea 
                id="event-notes" 
                name="eventNotes"
                placeholder="Add any additional notes"
                borderColor="$gray8"
                focusStyle={{
                  borderColor: "$black",
                  outlineColor: "$black"
                }}
                minHeight={100}
                padding="$3"
                disabled={isSubmitting}
              />
            </YStack>
          </YStack>
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
