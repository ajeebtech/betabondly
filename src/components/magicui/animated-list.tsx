"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type AnimatedListProps = {
  children: ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function AnimatedList({
  children,
  className,
  duration = 0.5,
  delay = 0.1,
}: AnimatedListProps) {
  const [childrenArray, setChildrenArray] = useState<ReactNode[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Array.isArray(children)) {
      setChildrenArray(children)
    } else {
      setChildrenArray([children])
    }
  }, [children])

  return (
    <div className={cn("relative w-full space-y-2", className)} ref={containerRef}>
      {childrenArray.map((child, i) => (
        <div
          key={i}
          className={cn(
            "opacity-0 translate-y-4",
            "animate-fade-in-up"
          )}
          style={{
            animationDelay: `${i * delay}s`,
            animationDuration: `${duration}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
