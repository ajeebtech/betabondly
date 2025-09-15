import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

declare const Tooltip: typeof TooltipPrimitive.Root
declare const TooltipTrigger: typeof TooltipPrimitive.Trigger
declare const TooltipProvider: typeof TooltipPrimitive.Provider

declare const TooltipContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    className?: string;
    sideOffset?: number;
  } & React.RefAttributes<React.ElementRef<typeof TooltipPrimitive.Content>>
>

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
