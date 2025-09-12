"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, side = "top", ...props }, ref) => {
  const initial = { 
    opacity: 0, 
    y: side === "top" ? 5 : side === "bottom" ? -5 : 0,
    x: side === "left" ? 5 : side === "right" ? -5 : 0,
    scale: 0.95 
  };
  
  const animate = { 
    opacity: 1, 
    y: 0, 
    x: 0,
    scale: 1 
  };
  
  const exit = { 
    opacity: 0, 
    y: side === "top" ? 5 : side === "bottom" ? -5 : 0,
    x: side === "left" ? 5 : side === "right" ? -5 : 0,
    scale: 0.95 
  };
  
  const transition = {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
    duration: 0.15
  };
  
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        side={side}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-gray-50 shadow-lg",
          className
        )}
        asChild
        {...props}
      >
        <motion.div
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          {props.children}
        </motion.div>
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
