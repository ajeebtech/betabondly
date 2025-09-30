"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "text-black",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
