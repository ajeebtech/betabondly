"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Download, RotateCw, Save } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { uploadMediaFile } from '@/lib/services/mediaService';
import { useParams } from 'next/navigation';

export default function PhotoboothPage() {
  const params = useParams();
  const coupleId = (params.coupleId as string) || "TEST_COUPLE_001";
  const { user } = useAuth();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 } 
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video stream
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and set as photo
        const imageDataUrl = canvas.toDataURL('image/png');
        setPhoto(imageDataUrl);
      }
    }
  };

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (photo) {
      setPhoto(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const downloadPhoto = () => {
    if (photo) {
      const link = document.createElement('a');
      link.download = `photobooth-${new Date().toISOString()}.png`;
      link.href = photo;
      link.click();
    }
  };

  const savePhotoToMedia = async () => {
    if (!photo || !user || !coupleId) return;
    
    setSaving(true);
    try {
      // Convert data URL to blob
      const response = await fetch(photo);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], `photobooth-${new Date().toISOString()}.png`, {
        type: 'image/png'
      });
      
      // Upload to media collection
      const { id } = await uploadMediaFile(file, user.uid, coupleId);
      
      alert('Photo saved to your media collection!');
      setPhoto(null);
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Photobooth</h1>
      
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-xl">
        {!isCameraActive ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-6">
              <CameraOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Camera is off</p>
              <Button 
                onClick={toggleCamera}
                className="bg-black text-white hover:bg-gray-800"
              >
                Turn On Camera
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover",
                photo && "hidden"
              )}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
            {photo && (
              <img 
                src={photo} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 flex gap-4">
        {isCameraActive && (
          <>
            <Button
              onClick={capturePhoto}
              disabled={!isCameraActive || isLoading}
              className="w-16 h-16 rounded-full bg-white border-2 border-black hover:bg-gray-100"
              title="Take photo"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600"></div>
            </Button>
            
            <Button
              onClick={switchCamera}
              disabled={!isCameraActive || isLoading}
              variant="outline"
              className="w-16 h-16 rounded-full"
              title="Switch camera"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
            
            {photo && (
              <>
                <Button
                  onClick={savePhotoToMedia}
                  disabled={saving}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  title="Save to media"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                </Button>
                
                <Button
                  onClick={downloadPhoto}
                  variant="outline"
                  className="w-16 h-16 rounded-full"
                  title="Download photo"
                >
                  <Download className="w-6 h-6" />
                </Button>
              </>
            )}
            
            <Button
              onClick={toggleCamera}
              variant="outline"
              className="w-16 h-16 rounded-full"
              title="Close camera"
            >
              <CameraOff className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center max-w-md">
        <p>Click the red button to take a photo. Switch between front and rear cameras using the switch button.</p>
      </div>
    </div>
  );
}
