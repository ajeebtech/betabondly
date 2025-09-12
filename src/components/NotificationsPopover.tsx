"use client"

import { useState, useEffect } from "react"
import { Bell, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Simple notification item type
interface NotificationItem {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

const NotificationsPopover = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Sample notifications data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "New message",
      message: "You have a new message from your partner",
      time: "2m ago",
      read: false
    },
    {
      id: 2,
      title: "Date reminder",
      message: "Your date night is coming up in 2 days",
      time: "1h ago",
      read: false
    },
    {
      id: 3,
      title: "New memory",
      message: "You have a new memory to view",
      time: "1d ago",
      read: true
    }
  ])

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Don't render anything on the server
  if (!isMounted) {
    return null
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full hover:bg-gray-100"
            aria-label="Notifications"
          >
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            {isOpen ? (
              <BellRing className="h-5 w-5 text-gray-900" />
            ) : (
              <Bell className="h-5 w-5 text-gray-900" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[100]"
          align="end"
          sideOffset={10}
          side="bottom"
          avoidCollisions={true}
          style={{
            position: 'fixed',
            top: '64px', // Height of the header
            right: '16px',
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notification.time}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
    </div>
  )
}

export default NotificationsPopover
