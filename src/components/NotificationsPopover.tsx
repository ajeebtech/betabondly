"use client"

import { useState } from "react"
import { Bell, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

type Notification = {
  id: number
  user: string
  action: string
  target: string
  timeAgo: string
  avatarInitials: string
}

export function NotificationsPopover() {
  const notifications: Notification[] = [
    {
      id: 1,
      user: "Jatin",
      action: "wrote a new post",
      target: "Our Anniversary Celebration",
      timeAgo: "2m ago",
      avatarInitials: "J"
    },
    {
      id: 2,
      user: "Hiya",
      action: "shared media",
      target: "Weekend Getaway",
      timeAgo: "1h ago",
      avatarInitials: "H"
    },
    {
      id: 3,
      user: "Jatin",
      action: "commented on",
      target: "Your latest memory",
      timeAgo: "3h ago",
      avatarInitials: "J"
    },
  ]

  const [isOpen, setIsOpen] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(true)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && hasNewNotification) {
      setHasNewNotification(false)
    }
  }

  // Animation variants
  const bellVariants = {
    initial: { rotate: 0 },
    ring: { 
      rotate: [0, -15, 15, -15, 0],
      transition: { duration: 0.8 }
    }
  }

  const badgeVariants = {
    initial: { scale: 1 },
    ping: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full group"
          onClick={() => setHasNewNotification(false)}
        >
          <motion.div
            animate={hasNewNotification ? "ring" : "initial"}
            variants={bellVariants}
          >
            <AnimatePresence>
              {isOpen ? (
                <BellRing key="bell-ring" className="h-5 w-5 text-pink-500" />
              ) : (
                <Bell key="bell" className="h-5 w-5" />
              )}
            </AnimatePresence>
          </motion.div>
          
          {notifications.length > 0 && (
            <motion.span 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              variants={badgeVariants}
              animate={hasNewNotification ? "ping" : "initial"}
            >
              {notifications.length}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 overflow-hidden" 
        align="end"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Notifications</h4>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Mark all as read
              </Button>
            </div>
          </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-200">
                      {notification.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.user}</span>{' '}
                      {notification.action} "{notification.target}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timeAgo}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="text-sm">
            View all notifications
          </Button>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}
