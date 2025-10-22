"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loaded?: boolean;
}

interface InfiniteGalleryProps {
  images: GalleryImage[];
  speed: number;
  zSpacing: number;
  visibleCount: number;
  falloff: { near: number; far: number };
  className: string;
  onError: () => void;
}

export default function InfiniteGallery({
  images,
  speed,
  zSpacing,
  visibleCount,
  falloff,
  className,
  onError
}: InfiniteGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy(0, e.deltaY * speed);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        window.scrollBy(0, 50 * speed);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollBy(0, -50 * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isClient, speed]);

  if (!isClient) return null;

  return (
    <div ref={containerRef} className={`${className} relative overflow-hidden min-h-[82vh]`}>
      {images.slice(0, visibleCount).map((image, index) => {
        // Compute a stable depth based on index rather than raw z-space
        const depth = index / Math.max(1, visibleCount - 1);
        // Conservative scaling to avoid extreme size changes
        const scale = Math.max(0.9, Math.min(1, 1 - depth * 0.08));
        // Mild opacity falloff only for deeper images
        const opacity = Math.max(0.6, 1 - depth * 0.3);
        // Disable vertical parallax for reliability across devices
        const parallax = 0;

        return (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate3d(0, ${parallax}px, 0) scale(${scale})`,
              opacity,
              zIndex: visibleCount - index,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="object-contain max-h-[82vh] max-w-[92vw] rounded-xl shadow-2xl"
              onError={onError}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
