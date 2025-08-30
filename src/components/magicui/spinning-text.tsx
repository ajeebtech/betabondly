"use client"

import { cn } from "@/lib/utils"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function SpinningText({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full text-sm font-medium",
        className,
      )}
      {...props}
    >
      <div
        className="inline-flex animate-marquee whitespace-nowrap"
        style={{
          animation: inView ? `marquee ${children?.toString().split("•").length * 2}s linear infinite` : "none",
        }}
      >
        {children}
      </div>
      <div
        className="absolute left-full ml-2 inline-flex animate-marquee whitespace-nowrap"
        style={{
          animation: inView ? `marquee ${children?.toString().split("•").length * 2}s linear infinite` : "none",
        }}
      >
        {children}
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
