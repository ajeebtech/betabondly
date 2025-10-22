"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  Heart, 
  Camera, 
  Image as ImageIcon, 
  Gamepad2, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sparkles,
  Bell,
  MessageCircle,
  Calendar,
  Star,
  Zap
} from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface EnhancedSidebarProps {
  className?: string;
}

export default function EnhancedSidebar({ className }: EnhancedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLink, setActiveLink] = useState("your bond");

  const links: SidebarLink[] = [
    {
      label: "your bond",
      href: "/default-couple",
      icon: Heart,
      isActive: activeLink === "your bond",
      onClick: () => setActiveLink("your bond")
    },
    {
      label: "photobooth",
      href: "/default-couple/photobooth",
      icon: Camera,
      isActive: activeLink === "photobooth",
      onClick: () => setActiveLink("photobooth")
    },
    {
      label: "media",
      href: "/default-couple/media", // This will be dynamic in a real app
      icon: ImageIcon,
      badge: "3",
      isActive: activeLink === "media",
      onClick: () => setActiveLink("media")
    },
    {
      label: "games",
      href: "/default-couple/games/textgame",
      icon: Gamepad2,
      badge: "new",
      isActive: activeLink === "games",
      onClick: () => setActiveLink("games")
    },
    {
      label: "messages",
      href: "#",
      icon: MessageCircle,
      badge: "2",
      isActive: activeLink === "messages",
      onClick: () => setActiveLink("messages")
    },
    {
      label: "calendar",
      href: "#",
      icon: Calendar,
      isActive: activeLink === "calendar",
      onClick: () => setActiveLink("calendar")
    },
    {
      label: "yourself",
      href: "#",
      icon: User,
      isActive: activeLink === "yourself",
      onClick: () => setActiveLink("yourself")
    },
    {
      label: "preferences",
      href: "#",
      icon: Settings,
      isActive: activeLink === "preferences",
      onClick: () => setActiveLink("preferences")
    },
    {
      label: "faqs",
      href: "#",
      icon: HelpCircle,
      isActive: activeLink === "faqs",
      onClick: () => setActiveLink("faqs")
    }
  ];

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-rose-100/30 shadow-lg z-50 overflow-hidden",
        "flex flex-col",
        className
      )}
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 220 : 64 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 400,
        damping: 35
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header with Logo */}
      <motion.div 
        className="px-4 py-6 border-b border-rose-100/20 flex items-center justify-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Image
            src="/images/bondly-logo.svg"
            alt="Bondly Logo"
            width={56}
            height={56}
            className="w-14 h-auto object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Navigation Links */}
      <motion.div 
        className="flex-1 px-2 py-3 space-y-1 overflow-y-auto -mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {links.map((link, index) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <motion.a
              href={link.href}
              onClick={link.onClick}
              className={cn(
                "relative flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-150 group",
                "hover:bg-pink-50",
                link.isActive 
                  ? "bg-pink-100 shadow-sm" 
                  : ""
              )}
              whileHover={{ scale: 1.01, x: 1 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Icon */}
              <motion.div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150",
                  link.isActive 
                    ? "bg-pink-500 text-white" 
                    : "text-gray-600 group-hover:text-pink-600"
                )}
                whileHover={{ rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <link.icon className="w-3.5 h-3.5" />
              </motion.div>

              {/* Label and Badge */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="flex-1 flex items-center justify-between min-w-0"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.1 }}
                  >
                    <span className={cn(
                      "text-sm font-medium truncate",
                      link.isActive ? "text-pink-700" : "text-gray-700 group-hover:text-pink-700"
                    )}>
                      {link.label}
                    </span>
                    
                    {link.badge && (
                      <motion.span
                        className={cn(
                          "px-1.5 py-0.5 text-xs font-medium rounded-full text-white",
                          link.badge === "new" 
                            ? "bg-green-500" 
                            : "bg-pink-500"
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                      >
                        {link.badge}
                      </motion.span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {link.isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-pink-500 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.a>
          </motion.div>
        ))}
      </motion.div>

      {/* Premium Link */}
      <motion.div
        className="px-2 pb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.a
          href="#"
          className="flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-150 group hover:bg-yellow-50"
          whileHover={{ scale: 1.01, x: 1 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md flex items-center justify-center group-hover:from-yellow-600 group-hover:to-orange-600 transition-all duration-150"
            whileHover={{ rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="text-sm font-medium bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent group-hover:from-yellow-700 group-hover:to-orange-700 transition-all"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.1 }}
              >
                premium
              </motion.span>
            )}
          </AnimatePresence>
        </motion.a>
      </motion.div>

      {/* User Profile and Logout */}
      <motion.div 
        className="px-2 pb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* User Profile */}
        <motion.div 
          className={cn(
            "flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-150 group cursor-pointer",
            "hover:bg-pink-50"
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            JR
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.1 }}
              >
                <p className="text-sm font-medium text-gray-700 truncate">Jatin Roy</p>
                <p className="text-xs text-gray-500 truncate">@ajeebasfuck</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Logout Button */}
        <motion.a
          href="#"
          className={cn(
            "flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-150 group mt-1",
            "hover:bg-red-50 hover:text-red-600"
          )}
          whileHover={{ scale: 1.01, x: 1 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div
            className="w-6 h-6 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-150"
            whileHover={{ rotate: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.1 }}
              >
                logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.a>
      </motion.div>
    </motion.div>
  );
}
