"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion, AnimatePresence, useAnimate } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || props.disabled) return;
    
    try {
      setIsLoading(true);
      setIsSuccess(false);
      
      // Call the original onClick handler if provided
      if (props.onClick) {
        await props.onClick(event);
      }
      
      // Show success state
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative flex min-w-[80px] items-center justify-center rounded-full px-4 py-2 font-medium text-white transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      {...buttonProps}
    >
      <span className={`relative flex items-center justify-center transition-opacity ${isLoading || isSuccess ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading && !isSuccess && <Loader />}
        {isSuccess && <CheckIcon />}
      </div>
    </motion.button>
  );
};

const Loader = () => {
  return (
    <motion.div 
      className="loader absolute inset-0 flex items-center justify-center"
      initial={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.5,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <motion.svg
        className="h-5 w-5 text-current"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2V6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 18V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4.92993 4.92993L7.75999 7.75999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.24 16.24L19.07 19.07"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2 12H6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 12H22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4.92993 19.07L7.75999 16.24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.24 7.75999L19.07 4.92993"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
};

const CheckIcon = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
    >
      <svg
        className="h-3.5 w-3.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </motion.div>
  );
};
