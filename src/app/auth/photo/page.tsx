"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

export default function PhotoStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      let photoURL = null;
      if (file && user) {
        const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "users", user.uid), { photoURL });
      }
      // If skipped, just continue
      router.push("/"); // TODO: Replace with couple assignment or couple page
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/"); // TODO: Replace with couple assignment or couple page
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
          <form onSubmit={handleUpload} className="space-y-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : "Continue"}
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={handleSkip} disabled={uploading}>
              Skip for now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
