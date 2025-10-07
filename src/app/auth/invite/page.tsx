"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

// Generate a 5-digit random invite code
function generateInviteCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export default function InviteStep() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate invite code when component mounts
    const code = generateInviteCode();
    setInviteCode(code);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Generate the invite link
        const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
        
        await updateDoc(doc(db, 'users', user.uid), {
          inviteCode: inviteCode,
          inviteLink: inviteLink,
          inviteStatus: "in process",
          updatedAt: new Date().toISOString(),
        });
        
        toast.success('Invite link generated successfully!');
        router.push('/default-couple'); // Redirect to main app
      }
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const generateNewCode = () => {
    const newCode = generateInviteCode();
    setInviteCode(newCode);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Your Invite Code</CardTitle>
          <CardDescription className="text-center">
            Share this code with your partner to connect your accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Your 5-digit invite code</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    readOnly
                    className="text-center text-lg font-mono tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateNewCode}
                  className="w-full text-sm"
                >
                  Generate new code
                </Button>
              </div>

              {/* Invite Link Display */}
              <div className="space-y-2">
                <Label>Your invite link</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/invite/${inviteCode}` : 'Loading...'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Share this link with your partner to connect your accounts
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Status: In Process</p>
              <p>Your partner can use this code to connect with you. Once they join, you'll both be able to access your shared couple space!</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Continue to App'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
