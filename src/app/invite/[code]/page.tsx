"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkInviteCode();
  }, [inviteCode]);

  const checkInviteCode = async () => {
    if (!inviteCode || inviteCode.length !== 5) {
      setError("Invalid invite code");
      setLoading(false);
      return;
    }

    try {
      // Find user with this invite code
      const q = query(
        collection(db, "users"),
        where("inviteCode", "==", inviteCode)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Invite code not found or expired");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      setInviteData({
        id: userDoc.id,
        ...userData
      });
      setLoading(false);
    } catch (error) {
      console.error("Error checking invite code:", error);
      setError("Failed to verify invite code");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (userInfo: any) => {
    if (!inviteData) return;
    
    setIsConnecting(true);
    try {
      // Check if user already has a couple
      const currentUserDoc = await getDoc(doc(db, "users", userInfo.uid));
      const currentUserData = currentUserDoc.data();
      
      if (currentUserData?.coupleId) {
        toast.error("You're already connected to another couple!");
        return;
      }

      // Check if the inviter already has a couple
      if (inviteData.coupleId) {
        // Join existing couple
        await updateDoc(doc(db, "couples", inviteData.coupleId), {
          users: [...inviteData.coupleId.split(','), userInfo.uid]
        });
        
        // Update both users
        await updateDoc(doc(db, "users", userInfo.uid), {
          coupleId: inviteData.coupleId,
          inviteStatus: "completed",
          updatedAt: new Date().toISOString(),
        });
        
        await updateDoc(doc(db, "users", inviteData.id), {
          inviteStatus: "completed",
          updatedAt: new Date().toISOString(),
        });
        
        toast.success("Successfully connected! Welcome to your couple space!");
        router.push(`/${inviteData.coupleId}`);
      } else {
        // Create new couple
        const coupleRef = doc(collection(db, "couples"));
        const coupleId = coupleRef.id;
        
        await updateDoc(coupleRef, {
          users: [inviteData.id, userInfo.uid],
          createdAt: new Date().toISOString(),
        });
        
        // Update both users
        await updateDoc(doc(db, "users", userInfo.uid), {
          coupleId: coupleId,
          inviteStatus: "completed",
          updatedAt: new Date().toISOString(),
        });
        
        await updateDoc(doc(db, "users", inviteData.id), {
          coupleId: coupleId,
          inviteStatus: "completed",
          updatedAt: new Date().toISOString(),
        });
        
        toast.success("Successfully connected! Welcome to your couple space!");
        router.push(`/${coupleId}`);
      }
    } catch (error) {
      console.error("Error connecting users:", error);
      toast.error("Failed to connect accounts. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying invite code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-red-600">Invalid Invite</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/sign-up')} 
              className="w-full"
            >
              Create New Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">Join {inviteData.displayName}</CardTitle>
          <CardDescription>
            You've been invited to connect your accounts and start sharing your couple journey!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Invite Code: {inviteCode}</p>
            <p>Sign in with Google to connect your account and start your couple journey together!</p>
          </div>
          
          <GoogleSignInButton
            className="w-full h-11"
            onSuccess={handleGoogleSignIn}
          />
          
          {isConnecting && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting accounts...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}