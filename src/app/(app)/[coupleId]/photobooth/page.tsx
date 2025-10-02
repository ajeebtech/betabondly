"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Download, RotateCw, X, Upload, RefreshCw } from 'lucide-react';
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { cn } from "@/lib/utils";

export default function PhotoboothPage() {
  const params = useParams();
  const coupleId = params.coupleId as string;
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null]);
  const [facingModes, setFacingModes] = useState<Array<'user' | 'environment'>>(["user", "environment"]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [photoStatus, setPhotoStatus] = useState<[boolean, boolean]>([false, false]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRefs = [useRef<MediaStream | null>(null), useRef<MediaStream | null>(null)];

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
    streamRefs.forEach((streamRef, index) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRefs[index].current) {
        videoRefs[index].current!.srcObject = null;
      }
    });
  }, []);

  const startCameras = useCallback(async () => {
    try {
      setIsLoading(true);
      stopCameras();
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // If only one camera is available, use it for both previews
      if (videoDevices.length === 1) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingModes[0],
            deviceId: videoDevices[0].deviceId ? { exact: videoDevices[0].deviceId } : undefined
          }
        });
        
        // Use the same stream for both video elements
        videoRefs.forEach(ref => {
          if (ref.current) {
            ref.current.srcObject = stream;
          }
        });
        streamRefs[0].current = stream;
        setActiveCameraIndex(0);
      } 
      // If multiple cameras are available, use different devices
      else if (videoDevices.length > 1) {
        for (let i = 0; i < 2; i++) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: facingModes[i],
                deviceId: videoDevices[i]?.deviceId ? { exact: videoDevices[i].deviceId } : undefined
              }
            });
            
            if (videoRefs[i]?.current) {
              videoRefs[i].current!.srcObject = stream;
              streamRefs[i].current = stream;
            }
            
            setActiveCameraIndex(i);
          } catch (error) {
            console.error(`Error accessing camera ${i + 1}:`, error);
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing cameras:', error);
      setIsLoading(false);
    }
  }, [facingModes, stopCameras]);

  const capturePhoto = useCallback((cameraIndex: number) => {
    const video = videoRefs[cameraIndex].current;
    if (video && video.srcObject) {
      // Create a temporary video element to ensure we have the latest frame
      const tempVideo = document.createElement('video');
      tempVideo.width = video.videoWidth;
      tempVideo.height = video.videoHeight;
      tempVideo.autoplay = true;
      tempVideo.playsInline = true;
      tempVideo.muted = true;
      
      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Update the photos state
        setPhotos(prev => {
          const newPhotos = [...prev];
          newPhotos[cameraIndex] = imageDataUrl;
          return newPhotos as [string | null, string | null];
        });
        
        // Update the photo status
        setPhotoStatus(prev => {
          const newStatus = [...prev] as [boolean, boolean];
          newStatus[cameraIndex] = true;
          return newStatus;
        });
        
        // Clear any previously generated image
        setGeneratedImage(null);
        
        // Clean up the temporary video element
        tempVideo.srcObject = null;
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
    setGeneratedImage(null); // Clear any previously generated image
    
    // Reset photos
    const newPhotos: (string | null)[] = [null, null];
    const newStatus: [boolean, boolean] = [false, false];
    
    // Process each file
    const fileReaders = files.map((file, index) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPhotos[index] = e.target?.result as string;
          newStatus[index] = true;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(fileReaders).then(() => {
      setPhotos(newPhotos as [string | null, string | null]);
      setPhotoStatus(newStatus);
    });
    
    // Reset input to allow re-uploading same file
    event.target.value = '';
  }, []);
  
  const toggleFileUpload = useCallback(() => {
    const newUseFileUpload = !useFileUpload;
    
    if (newUseFileUpload) {
      // Switching to file upload mode
      if (isCameraActive) {
        stopCameras();
        setIsCameraActive(false);
      }
    } else {
      // Switching to camera mode
      setUploadedFiles([]);
      setPhotos([null, null]);
      setPhotoStatus([false, false]);
      setGeneratedImage(null);
    }
    
    setUseFileUpload(newUseFileUpload);
  }, [useFileUpload, isCameraActive, stopCameras]);
  
  const generateImage = useCallback(async () => {
    if (photos.filter(Boolean).length !== 2) return;
    
    try {
      setIsGenerating(true);
      setGeneratedImage(null);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: photos.filter(Boolean),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      // Format the image URL with the correct data URL prefix and mimeType
      const imageUrl = `data:${data.mimeType || 'image/jpeg'};base64,${data.image}`;
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsGenerating(false);
    }
  }, [photos]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 relative">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      <div className="flex-1 flex flex-col ml-[64px] transition-all duration-300 relative z-10 overflow-x-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-4 lg:p-8 w-full">
          <div className="w-full max-w-[1600px] px-2 mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">photobooth</h1>
              <p className="text-gray-600 mt-1">capture your special moments together, powered by Nano Banana</p>
            </div>
            <div className="flex flex-col lg:flex-row w-full gap-6">
              {/* Upload Section - Fixed Left Side */}
              <div className="w-full lg:w-[300px] shrink-0">
                <div className="sticky top-6">
                  <div className="p-6 bg-white rounded-lg shadow-lg">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
              </div>
              {/* Camera Previews - Right Side */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[0, 1].map((cameraIndex) => (
                    <div key={cameraIndex} className="flex flex-col items-center">
                      <div className="flex flex-col items-center w-full">
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/5] w-full max-w-[400px] mx-auto">
                          {!isCameraActive && !useFileUpload ? (
                            <div className="w-full h-full flex items-center justify-center">
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
                                  ref={videoRefs[cameraIndex]}
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
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="mt-2 w-full max-w-[400px] mx-auto">
                        <Button
                          onClick={() => {
                            setUseFileUpload(false);
                            setActiveCameraIndex(cameraIndex);
                            if (!isCameraActive) {
                              setIsCameraActive(true);
                            }
                            if (photos[cameraIndex]) {
                              // If photo exists, clear it when clicking the camera button
                              const newPhotos = [...photos];
                              newPhotos[cameraIndex] = null;
                              setPhotos(newPhotos);
setPhotoStatus(prev => {
                                const newStatus = [...prev] as [boolean, boolean];
                                newStatus[cameraIndex] = false;
                                return newStatus;
                              });
                            } else if (isCameraActive && activeCameraIndex === cameraIndex) {
                              // Capture photo if camera is active and this is the active camera
                              capturePhoto(cameraIndex);
                            }
                          }}
                          className={`w-full py-2 flex items-center justify-center gap-2 ${isCameraActive && activeCameraIndex === cameraIndex ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {photos[cameraIndex] ? (
                            <>
                              <RotateCw className="w-4 h-4" />
                              Retake Photo {cameraIndex + 1}
                            </>
                          ) : isCameraActive && activeCameraIndex === cameraIndex ? (
                            <>
                              <Camera className="w-4 h-4" />
                              Capture Photo {cameraIndex + 1}
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              Open Camera {cameraIndex + 1}
                            </>
                          )}
                        </Button>
                      </div>
                      <div className={cn(
                        "mt-2 px-4 py-2 rounded-full text-sm font-medium transition-colors w-full text-center",
                        photoStatus[cameraIndex] 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      )}>
                        {photoStatus[cameraIndex] 
                          ? `Photo ${cameraIndex + 1} uploaded!` 
                          : `Waiting for ${cameraIndex === 0 ? 'first' : 'second'} photo`}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Generate Button */}
                <div className="mt-8 text-center">
                  <Button
                    onClick={generateImage}
                    disabled={photos.filter(Boolean).length !== 2 || isGenerating}
                    className={`px-8 py-3 text-lg ${photos.filter(Boolean).length === 2 && !isGenerating ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      '✨ Generate Magic'
                    )}
                  </Button>
                  {photos.filter(Boolean).length !== 2 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Please upload or capture 2 photos to generate a new image
                    </p>
                  )}
                  
                  {/* Generated Image Preview */}
                  {generatedImage && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Generated Image</h3>
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-square w-full max-w-md mx-auto">
                        <img
                          src={generatedImage}
                          alt="Generated composition"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 right-4">
                          <Button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.download = 'generated-image.png';
                              link.href = generatedImage;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
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
