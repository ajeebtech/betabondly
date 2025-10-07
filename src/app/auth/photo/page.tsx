"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

export default function PhotoStep() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (user) {
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `profile-${timestamp}.${fileExtension}`;
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `profiles/${user.uid}/${fileName}`);
        await uploadBytes(storageRef, file);
        
        // Get download URL
        const photoURL = await getDownloadURL(storageRef);
        
        // Update user document in Firestore
        await updateDoc(doc(db, "users", user.uid), { 
          photoURL,
          updatedAt: new Date().toISOString()
        });
        
        toast.success('Profile picture uploaded successfully!');
        router.push("/auth/date");
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError("Failed to upload photo. Please try again.");
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/auth/date");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Add a profile picture</CardTitle>
          <CardDescription className="text-center">
            You can skip this step and add a photo later if you want.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <Label htmlFor="photo" className="text-sm font-medium">
                Choose a profile picture
              </Label>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="photo" className="cursor-pointer">
                  {preview ? (
                    <div className="space-y-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-gray-200"
                      />
                      <p className="text-sm text-gray-600">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload a photo</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={!file || uploading}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload & Continue</span>
                  </div>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11" 
                onClick={handleSkip}
                disabled={uploading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
