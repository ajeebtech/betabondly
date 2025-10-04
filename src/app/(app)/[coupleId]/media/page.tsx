"use client";

import { useParams } from "next/navigation";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import { Button } from "../../../../../components/ui/button";
import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Video, FileText, Calendar } from "lucide-react";

const mockMedia = [
  { 
    id: 1, 
    type: "video", 
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    name: "2025-06-26 16-01-06.mp4",
    size: "2 MB",
    uploadDate: "Jul 10, 2025"
  },
  { 
    id: 2, 
    type: "image", 
    url: "/bondly.png", 
    name: "bondly.png",
    size: "1.2 MB",
    uploadDate: "Jul 9, 2025"
  },
  { 
    id: 3, 
    type: "image", 
    url: "/bondlypink.png", 
    name: "bondlypink.png",
    size: "0.8 MB",
    uploadDate: "Jul 8, 2025"
  },
  { 
    id: 4, 
    type: "image", 
    url: "/pinkbonddd.png", 
    name: "pinkbonddd.png",
    size: "1.5 MB",
    uploadDate: "Jul 7, 2025"
  },
];

export default function CoupleMediaPage() {
  const params = useParams();
  const coupleId = (params.coupleId as string) || "default-couple";
  const [media, setMedia] = useState(mockMedia);
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "images" | "videos">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Handle file drop here
    console.log("Files dropped:", e.dataTransfer.files);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const filteredMedia = media.filter(item => {
    if (selectedType === "images") return item.type === "image";
    if (selectedType === "videos") return item.type === "video";
    return true;
  });

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
                : "border-orange-300 bg-white hover:border-orange-400 hover:bg-orange-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Upload className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Media</h2>
            <p className="text-gray-600 mb-6">Drag and drop your photos or videos here, or click to browse.</p>
            
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
            >
              Choose Files
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                console.log("Files selected:", e.target.files);
              }}
            />
          </div>

          {/* Media Grid */}
          {filteredMedia.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            controls
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            video
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <span>{item.size}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{item.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
