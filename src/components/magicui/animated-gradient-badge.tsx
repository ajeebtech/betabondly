"use client";

import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "./animated-gradient-text";
import { ChevronRight } from "lucide-react";

interface AnimatedGradientBadgeProps {
  className?: string;
  icon?: React.ReactNode;
  text: string;
  showChevron?: boolean;
}

export function AnimatedGradientBadge({
  className,
  icon = "✨",
  text,
  showChevron = true,
}: AnimatedGradientBadgeProps) {
  return (
    <div className={cn(
      "group relative flex items-center justify-center rounded-full px-4 py-2 bg-black text-white text-sm font-medium",
      className
    )}>
      {text}
    </div>
  );
}
