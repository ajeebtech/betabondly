"use client";

import { useParams } from "next/navigation";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AccessDenied } from '@/components/AccessDenied';
import { getFavoriteMedia } from '@/lib/services/mediaService';
import { Media } from '@/types/db';
import dynamic from 'next/dynamic';

// Type for our image objects
interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loaded?: boolean;
}

// Dynamically import the InfiniteGallery component
const InfiniteGallery = dynamic<{ 
  images: GalleryImage[]; 
  speed: number; 
  zSpacing: number; 
  visibleCount: number; 
  falloff: { near: number; far: number }; 
  className: string; 
  onError: () => void;
}>(
  () => import('@/components/InfiniteGallery'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading your memories...</div>
      </div>
    )
  }
);

export default function WrappedPage() {
  const params = useParams();
  const coupleId = (params.coupleId as string) || "TEST_COUPLE_001";
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);
  const errorCountRef = useRef(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function checkMembership() {
      if (!user) {
        setChecking(false);
        return;
      }
      
      try {
        const coupleRef = doc(db, 'couples', coupleId);
        const coupleSnap = await getDoc(coupleRef);
        
        if (!coupleSnap.exists()) {
          setAccessDenied(true);
          setChecking(false);
          return;
        }
        
        const coupleData = coupleSnap.data();
        if (!coupleData.members || !coupleData.members.includes(user.uid)) {
          setAccessDenied(true);
        } else {
          setAccessDenied(false);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setAccessDenied(true);
      } finally {
        setChecking(false);
      }
    }
    
    if (!authLoading) {
      checkMembership();
    }
  }, [user, authLoading, coupleId]);

  // Fetch favorite media
  useEffect(() => {
    async function fetchFavoriteImages() {
      if (!coupleId || accessDenied) return;

      try {
        setLoading(true);
        setError(null);
        
        const favoriteMedia = await getFavoriteMedia(coupleId);
        
        // Filter only images and convert to GalleryImage format
        const imageItems: GalleryImage[] = favoriteMedia
          .filter(media => media.fileType === 'image')
          .map(media => ({
            src: media.fileUrl,
            alt: media.fileName || 'Favorite memory',
            loaded: false
          }));

        if (imageItems.length === 0) {
          setError("No favorite images found. Start favoriting some photos in the media section!");
          setLoading(false);
          return;
        }

        // Preload images
        const totalImages = imageItems.length;
        let loadedCount = 0;

        const loadPromises = imageItems.map((img, index) => {
          return new Promise<void>((resolve) => {
            const image = new Image();
            image.onload = () => {
              loadedCount++;
              const newProgress = Math.floor((loadedCount / totalImages) * 100);
              setProgress(newProgress);
              resolve();
            };
            image.onerror = () => {
              console.warn(`Failed to load image: ${img.src}`);
              loadedCount++;
              const newProgress = Math.floor((loadedCount / totalImages) * 100);
              setProgress(newProgress);
              resolve();
            };
            image.src = img.src;
          });
        });

        await Promise.all(loadPromises);
        setImages(imageItems);
        setProgress(100);
        
        setTimeout(() => {
          setLoading(false);
        }, 300);
        
      } catch (err) {
        console.error('Error fetching favorite images:', err);
        setError(err instanceof Error ? err.message : "Failed to load favorite images");
        setLoading(false);
      }
    }

    if (!accessDenied && !checking) {
      fetchFavoriteImages();
    }
  }, [coupleId, accessDenied, checking]);

  const handleGalleryError = useCallback(() => {
    errorCountRef.current += 1;
    if (errorCountRef.current < 3) {
      console.log('Gallery error occurred, remounting...');
      setGalleryKey(prev => prev + 1);
    }
  }, []);

  if (authLoading || checking) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return (
      <AccessDenied 
        title="Sign In Required"
        message="Please sign in to access this couple's wrapped."
        showBackButton={true}
        showHomeButton={true}
        customAction={{
          label: "Sign In",
          onClick: () => window.location.href = '/sign-in'
        }}
      />
    );
  }
  
  if (accessDenied) {
    return (
      <AccessDenied 
        title="Access Denied"
        message="You do not have permission to view this couple's wrapped."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // Show error state if there's an error
  if (error && !loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <aside className="shrink-0 relative z-40">
          <EnhancedSidebar coupleId={coupleId} />
        </aside>
        <main className="flex-1 flex items-center justify-center ml-[64px]">
          <div className="text-center p-6 bg-black/80 rounded-lg">
            <h1 className="font-serif text-2xl mb-4">Unable to load your memories</h1>
            <p className="font-mono text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition font-medium"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <aside className="shrink-0 relative z-40">
          <EnhancedSidebar coupleId={coupleId} />
        </aside>
        <div className="flex-1 flex flex-col items-center justify-center ml-[64px]">
          <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">Loading your favorite memories... {progress}%</p>
        </div>
      </div>
    );
  }

  // Only render the gallery on the client
  if (!isClient) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <aside className="shrink-0 relative z-40">
          <EnhancedSidebar coupleId={coupleId} />
        </aside>
        <div className="flex-1 flex items-center justify-center ml-[64px]">
          <div className="text-white">Initializing your memories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Enhanced Sidebar */}
      <aside className="shrink-0 relative z-40">
        <EnhancedSidebar coupleId={coupleId} />
      </aside>

      <main className="flex-1 ml-[64px]">
        {images.length > 0 ? (
          <div key={`gallery-${galleryKey}`} className="h-screen w-full relative">
            <InfiniteGallery
              images={images}
              speed={1.0}
              zSpacing={2}
              visibleCount={Math.min(images.length, 10)}
              falloff={{ near: 0.6, far: 1 }}
              className="h-full w-full"
              onError={handleGalleryError}
            />

            {/* Overlay title */}
            <div className="h-screen inset-0 pointer-events-none fixed flex items-center justify-center text-center px-3 mix-blend-exclusion text-white">
              <h1 className="font-serif text-4xl md:text-7xl tracking-tight">
                <span className="italic">us.</span>
              </h1>
            </div>

            {/* Instructions */}
            <div className="text-center fixed bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold">
              <p>Use mouse wheel, arrow keys, or touch to navigate</p>
              <p className="opacity-60">Your favorite memories together</p>
            </div>

            {/* Fallback thumbnail strip to verify images render */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/30 backdrop-blur-sm overflow-x-auto whitespace-nowrap">
              <div className="flex gap-2">
                {images.slice(0, 12).map((img, i) => (
                  <img key={i} src={img.src} alt={img.alt} className="h-14 w-14 object-cover rounded-md border border-white/20" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-screen w-full flex items-center justify-center text-white">
            No images to display. Try favoriting some photos in media.
          </div>
        )}
      </main>
    </div>
  );
}
