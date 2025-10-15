"use client";

import { useParams } from "next/navigation";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { Button } from "../../../../../components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Video, FileText, Calendar, Heart } from "lucide-react";
import { getMediaByCouple, uploadMediaFile, toggleMediaFavorite } from '@/lib/services/mediaService';
import { Media } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccessDenied } from '@/components/AccessDenied';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CoupleMediaPage() {
  const params = useParams();
  const coupleId = (params.coupleId as string) || "TEST_COUPLE_001";
  const { user, loading: authLoading } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "images" | "videos">("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (files: File[]) => {
    if (!user || !coupleId) return;
    
    setUploading(true);
    try {
      for (const file of files) {
        await uploadMediaFile(file, user.uid, coupleId);
      }
      // Refresh media list
      await loadMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const coupleMedia = await getMediaByCouple(coupleId);
      setMedia(coupleMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (mediaId: string, currentFavorite: boolean) => {
    try {
      await toggleMediaFavorite(mediaId, !currentFavorite);
      // Update local state
      setMedia(prev => prev.map(item => 
        item.id === mediaId ? { ...item, isFavorite: !currentFavorite } : item
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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

  useEffect(() => {
    if (!accessDenied && !checking) {
      loadMedia();
    }
  }, [accessDenied, checking, coupleId]);

  const filteredMedia = media.filter(item => {
    if (selectedType === "images") return item.fileType === "image";
    if (selectedType === "videos") return item.fileType === "video";
    return true;
  });

  if (authLoading || checking) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return (
      <AccessDenied 
        title="Sign In Required"
        message="Please sign in to access this couple's media."
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
        message="You do not have permission to view this couple's media."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Enhanced Sidebar */}
      <aside className="shrink-0 relative z-40">
        <EnhancedSidebar />
      </aside>

      <div className="flex-1 flex flex-col relative ml-[64px]">
        {/* Top Navigation Bar */}
        <header className="w-full bg-white/80 backdrop-blur-sm border-b border-rose-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Media</h1>
              <p className="text-sm text-gray-600">Store and manage your photos and videos</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Upload Area */}
          <div 
            className={`w-full border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              dragOver 
                ? "border-orange-400 bg-orange-50" 
                : uploading
                ? "border-orange-500 bg-orange-100"
                : "border-orange-300 bg-white hover:border-orange-400 hover:bg-orange-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            ) : (
              <Upload className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {uploading ? "Uploading..." : "Upload Media"}
            </h2>
            <p className="text-gray-600 mb-6">
              {uploading ? "Please wait while your files are being uploaded..." : "Drag and drop your photos or videos here, or click to browse."}
            </p>
            
            {/* Type Selection */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedType("images");
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "images" 
                    ? "bg-orange-100 text-orange-700" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Images</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedType("videos");
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedType === "videos" 
                    ? "bg-orange-100 text-orange-700" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Videos</span>
              </button>
            </div>
            
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect();
              }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Choose Files"}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  handleFileUpload(files);
                }
              }}
            />
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="mt-8 flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.fileType === "image" ? (
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={item.fileUrl}
                            className="w-full h-full object-cover"
                            controls
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            video
                          </div>
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id, item.isFavorite);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                          item.isFavorite 
                            ? "bg-red-500 text-white" 
                            : "bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${item.isFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate">{item.fileName}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <span>{formatFileSize(item.fileSize)}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center py-12">
              <p className="text-gray-500 text-lg">No media uploaded yet. Start by uploading some photos or videos!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
