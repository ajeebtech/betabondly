"use client"

import { useState } from "react"
import { Bell, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationsList } from "./Notifications/NotificationsList"

const NotificationsPopover = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(true)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && hasNewNotification) {
      setHasNewNotification(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-gray-100"
        >
          {hasNewNotification && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
          {isOpen ? (
            <BellRing className="h-5 w-5 text-gray-900" />
          ) : (
            <Bell className="h-5 w-5 text-gray-900" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-white border border-gray-100 shadow-sm shadow-gray-100/30" align="end">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-blue-600 hover:text-blue-700"
            onClick={() => setHasNewNotification(false)}
          >
            Mark all as read
          </Button>
        </div>
        <NotificationsList />
        <div className="p-2 border-t border-gray-200 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationsPopover
