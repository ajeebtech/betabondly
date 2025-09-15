"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Download, RotateCw, X, Upload, RefreshCw } from 'lucide-react';
import SidebarDemo from "@/components/sidebar-demo";
import { cn } from "@/lib/utils";

export default function PhotoboothPage() {
  const params = useParams();
  const coupleId = params.coupleId as string;
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null]);
  const [facingModes, setFacingModes] = useState<Array<'user' | 'environment'>>(["user", "environment"]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraActive) {
      startCameras();
    } else {
      stopCameras();
    }

    return () => {
      stopCameras();
    };
  }, [isCameraActive, facingModes]);

  const stopCameras = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameras = useCallback(async () => {
    try {
      setIsLoading(true);
      stopCameras();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingModes[0]
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setActiveCameraIndex(0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsLoading(false);
    }
  }, [facingModes, stopCameras]);

  const capturePhoto = useCallback((cameraIndex: number) => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        setPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[cameraIndex] = imageDataUrl;
          return newPhotos as [string | null, string | null];
        });
      }
    }
  }, []);

  const downloadPhoto = useCallback((photoDataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.download = `photo-${index + 1}.png`;
    link.href = photoDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const switchCamera = useCallback((index: number) => {
    setFacingModes(prev => {
      const newModes = [...prev];
      newModes[index] = prev[index] === 'user' ? 'environment' : 'user';
      return newModes as Array<'user' | 'environment'>;
    });
    
    if (isCameraActive) {
      startCameras();
    }
  }, [isCameraActive, startCameras]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCameras();
    } else {
      setUseFileUpload(false);
      await startCameras();
    }
    setIsCameraActive(!isCameraActive);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 2);
    if (files.length === 0) return;
    
    setUploadedFiles(files);
    
    // Process each file
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[index] = e.target?.result as string;
          return newPhotos as [string | null, string | null];
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input to allow re-uploading same file
    event.target.value = '';
  }, []);
  
  const toggleFileUpload = useCallback(() => {
    if (useFileUpload) {
      setUploadedFiles([]);
      setPhotos([null, null]);
    } else {
      if (isCameraActive) {
        stopCameras();
        setIsCameraActive(false);
      }
    }
    setUseFileUpload(!useFileUpload);
  }, [useFileUpload, isCameraActive, stopCameras, setIsCameraActive, setUseFileUpload, setUploadedFiles, setPhotos]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="shrink-0 relative z-40">
        <div className="w-[300px] h-full bg-white">
          <SidebarDemo />
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-4 lg:p-8">
          <div className="w-full max-w-[2400px] px-2">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">photobooth</h1>
              <p className="text-gray-600 mt-1">capture your special moments together, powered by Nano Banana</p>
            </div>

            <div className="flex justify-center w-full">
              <div className="w-full max-w-[1800px] space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {[0, 1].map((cameraIndex) => (
                    <div key={cameraIndex} className="flex flex-col items-center">
                      <div className="relative w-full aspect-video max-h-[60vh] min-h-[350px] bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
                        {!isCameraActive && !useFileUpload ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center p-6">
                              <CameraOff className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-600">Camera {cameraIndex + 1} is off</p>
                            </div>
                          </div>
                        ) : useFileUpload ? (
                          photos[cameraIndex] ? (
                            <img
                              src={photos[cameraIndex]!}
                              alt={`Uploaded photo ${cameraIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <div className="text-center p-6">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600">Photo {cameraIndex + 1} placeholder</p>
                              </div>
                            </div>
                          )
                        ) : (
                          <>
                            <div className="absolute inset-0 w-full h-full">
                              <video
                                ref={cameraIndex === 0 ? videoRef : undefined}
                                autoPlay
                                playsInline
                                muted
                                className={cn(
                                  "w-full h-full object-cover",
                                  photos[cameraIndex] && "hidden"
                                )}
                              />
                            </div>

                            {isLoading && cameraIndex === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                              </div>
                            )}

                            {photos[cameraIndex] && (
                              <img
                                src={photos[cameraIndex]!}
                                alt={`Captured memory ${cameraIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      {isCameraActive && (
                        <div className="mt-4 flex justify-center gap-3">
                          <Button
                            onClick={() => capturePhoto(cameraIndex)}
                            disabled={!isCameraActive || isLoading}
                            className="w-14 h-14 rounded-full bg-white border-2 border-black hover:bg-gray-100"
                            title="Take photo"
                          >
                            <div className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600"></div>
                          </Button>

                          <Button
                            onClick={() => switchCamera(cameraIndex)}
                            disabled={!isCameraActive || isLoading}
                            variant="outline"
                            className="w-14 h-14 rounded-full"
                            title="Switch camera"
                          >
                            <RotateCw className="w-5 h-5" />
                          </Button>

                          {photos[cameraIndex] && (
                            <Button
                              onClick={() => downloadPhoto(photos[cameraIndex]!, cameraIndex)}
                              variant="outline"
                              className="w-14 h-14 rounded-full"
                              title="Download photo"
                            >
                              <Download className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Upload Section */}
                <div className="w-full mt-8">
                  <div className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Upload className="w-12 h-12 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700">
                          Upload your photos
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                          Drag and drop your images here, or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                          Supports: .jpeg, .jpg, .png (max 5MB each)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          onClick={() => document.getElementById('file-upload')?.click()}
                          variant="outline"
                          className="mt-2 px-6 py-2 text-sm border-black"
                        >
                          Select Files
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cook Button */}
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => {
                      // Handle the cook action here
                      alert('Cooking with the selected photos!');
                    }}
                    disabled={photos.filter(Boolean).length !== 2}
                    className={`px-8 py-3 text-lg ${photos.filter(Boolean).length === 2 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    🍳 Cook
                  </Button>
                  {photos.filter(Boolean).length !== 2 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Please select 2 photos to enable cooking
                    </p>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
