"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarPremiumButton } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SettingsIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 text-neutral-900"
  >
    <path 
      d="M5 21L5 15M5 15C6.10457 15 7 14.1046 7 13C7 11.8954 6.10457 11 5 11C3.89543 11 3 11.8954 3 13C3 14.1046 3.89543 15 5 15ZM5 7V3M12 21V15M12 7V3M12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7ZM19 21V17M19 17C20.1046 17 21 16.1046 21 15C21 13.8954 20.1046 13 19 13C17.8954 13 17 13.8954 17 15C17 16.1046 17.8954 17 19 17ZM19 9V3" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 text-neutral-900"
  >
    <path 
      d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const SupportIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 text-neutral-900"
  >
    <path 
      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function SidebarDemo() {
  const links = [
    {
      label: "your bond",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-900" />
      ),
    },
    {
      label: "media",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-neutral-900">
          <path d="M2.5 12H21.5M6 16H10M8.96656 4H15.0334C16.1103 4 16.6487 4 17.1241 4.16396C17.5445 4.30896 17.9274 4.5456 18.2451 4.85675C18.6043 5.2086 18.8451 5.6902 19.3267 6.65337L21.4932 10.9865C21.6822 11.3645 21.7767 11.5535 21.8434 11.7515C21.9026 11.9275 21.9453 12.1085 21.971 12.2923C22 12.4992 22 12.7105 22 13.1331V15.2C22 16.8802 22 17.7202 21.673 18.362C21.3854 18.9265 20.9265 19.3854 20.362 19.673C19.7202 20 18.8802 20 17.2 20H6.8C5.11984 20 4.27976 20 3.63803 19.673C3.07354 19.3854 2.6146 18.9265 2.32698 18.362C2 17.7202 2 16.8802 2 15.2V13.1331C2 12.7105 2 12.4992 2.02897 12.2923C2.05471 12.1085 2.09744 11.9275 2.15662 11.7515C2.22326 11.5535 2.31776 11.3645 2.50675 10.9865L4.67331 6.65337C5.1549 5.69019 5.3957 5.2086 5.75495 4.85675C6.07263 4.5456 6.45551 4.30896 6.87589 4.16396C7.35125 4 7.88969 4 8.96656 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "games",
      href: "/default-couple/games/textgame",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-neutral-900">
          <path d="M5.99989 11H9.99989M7.99989 9V13M14.9999 12H15.0099M17.9999 10H18.0099M10.4488 5H13.5509C16.1758 5 17.4883 5 18.5184 5.49743C19.4254 5.9354 20.179 6.63709 20.6805 7.51059C21.2501 8.5027 21.3436 9.81181 21.5306 12.43L21.7766 15.8745C21.8973 17.5634 20.5597 19 18.8664 19C18.0005 19 17.1794 18.6154 16.6251 17.9502L16.2499 17.5C15.9068 17.0882 15.7351 16.8823 15.5398 16.7159C15.1302 16.3672 14.6344 16.1349 14.1043 16.0436C13.8514 16 13.5834 16 13.0473 16H10.9525C10.4164 16 10.1484 16 9.89553 16.0436C9.36539 16.1349 8.86957 16.3672 8.46 16.7159C8.26463 16.8823 8.09305 17.0882 7.74989 17.5L7.37473 17.9502C6.8204 18.6154 5.99924 19 5.13335 19C3.44013 19 2.1025 17.5634 2.22314 15.8745L2.46918 12.43C2.65619 9.81181 2.7497 8.5027 3.31926 7.51059C3.82074 6.63709 4.57433 5.9354 5.48135 5.49743C6.51151 5 7.82396 5 10.4488 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "yourself",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-900" />
      ),
    },
    {
      label: "preferences",
      href: "#",
      icon: <SettingsIcon />,
    },
    {
      label: "faqs",
      href: "#",
      icon: <SupportIcon />,
    },
    {
      label: "logout",
      href: "#",
      icon: <LogoutIcon />,
    },
  ];
  const [open, setOpen] = useState(false);
  
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden bg-white md:flex-row shadow-lg",
        "h-screen",
        "light"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="hover:opacity-80 transition-opacity focus:outline-none"
              >
                {open ? (
                  <span className={`${inter.className} text-2xl font-bold text-pink-500`}>
                    bondly.
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-pink-500">b</span>
                )}
              </button>
            </div>
            <div className="flex-1">
              <div className="mt-2 flex flex-col gap-1">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
                <SidebarPremiumButton />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <SidebarLink
              link={{
                label: "User Name",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-pink-500 flex items-center justify-center text-white">
                    UN
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-pink-500" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${inter.className} text-2xl font-bold text-pink-500`}
      >
        bondly.
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-pink-500" />
    </a>
  );
};
