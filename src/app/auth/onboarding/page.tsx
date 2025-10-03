"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

export default function OnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [datingStartDate, setDatingStartDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      let photoURL = null;
      if (file && user) {
        const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }
      // Save all onboarding data to Firestore
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          displayName: name,
          datingStartDate,
          photoURL: photoURL || null,
        });
      }
      // Redirect to couple page or dashboard
      router.push("/"); // TODO: Replace with /[coupleId] if available
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Onboarding</CardTitle>
          <CardDescription className="text-center">
            {step === 0 && "What's your name?"}
            {step === 1 && "When did you start dating?"}
            {step === 2 && "Add a profile picture (optional)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            {step === 0 && (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
            )}
            {step === 1 && (
              <Input
                type="date"
                value={datingStartDate}
                onChange={(e) => setDatingStartDate(e.target.value)}
                required
              />
            )}
            {step === 2 && (
              <>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? "Uploading..." : "Finish"}
                </Button>
                <Button type="button" variant="outline" className="w-full mt-2" onClick={handleSubmit} disabled={uploading}>
                  Skip for now
                </Button>
              </>
            )}
            {step > 0 && step < 2 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {step < 2 && (
              <Button type="submit" className="w-full">
                Next
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
