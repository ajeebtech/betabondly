"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/magicui/animated-list"

interface NotificationItem {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

const notifications: NotificationItem[] = [
  {
    name: "New date planned",
    description: "Romantic dinner at Le Petit Bistro",
    time: "15m ago",
    icon: "💑",
    color: "#FF6B6B",
  },
  {
    name: "Memory created",
    description: "Check out your new memory from last weekend",
    time: "1h ago",
    icon: "📸",
    color: "#4ECDC4",
  },
  {
    name: "New message",
    description: "From your partner",
    time: "2h ago",
    icon: "💬",
    color: "#45B7D1",
  },
  {
    name: "Activity suggestion",
    description: "New date idea: Sunset picnic at the park",
    time: "1d ago",
    icon: "💡",
    color: "#96CEB4",
  },
]

const Notification = ({
  name,
  description,
  icon,
  color,
  time,
}: NotificationItem) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "relative p-4 mb-2 rounded-lg shadow-sm",
          "bg-white",
          "border border-gray-100",
          "transition-all duration-200 ease-in-out hover:shadow-sm",
          "shadow-gray-100/50 hover:shadow-gray-200/50"
        )}
      >
        <div className="flex items-start">
          <div
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full"
            style={{ backgroundColor: color }}
          >
            <span className="text-lg">{icon}</span>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {name}
              </h3>
              <p className="text-xs text-gray-500">
                {time}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsList({ className }: { className?: string }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={cn(
        "relative max-h-[500px] w-full overflow-y-auto py-2 px-1",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        "dark:scrollbar-thumb-gray-600",
        className
      )}>
        <AnimatedList duration={0.3} delay={0.08}>
          {notifications.map((item, idx) => (
            <div key={idx} className="px-2 py-1">
              <Notification {...item} />
            </div>
          ))}
        </AnimatedList>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-gray-800"></div>
    </div>
  )
}
