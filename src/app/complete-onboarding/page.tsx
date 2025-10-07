"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

// Generate a 5-digit random invite code
function generateInviteCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export default function CompleteOnboardingPage() {
  const router = useRouter();
  const [datingStartDate, setDatingStartDate] = useState<Date | undefined>(undefined);
  const [inviteCode] = useState(generateInviteCode());
  const [loading, setLoading] = useState(false);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datingStartDate) return;
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Generate the invite link
        const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
        
        await updateDoc(doc(db, 'users', user.uid), {
          datingStartDate: datingStartDate.toISOString(),
          inviteCode: inviteCode,
          inviteLink: inviteLink,
          inviteStatus: "in process",
          updatedAt: new Date().toISOString(),
        });
        
        toast.success('Onboarding completed! Your invite link is ready.');
        router.push('/default-couple');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Setup</CardTitle>
          <CardDescription className="text-center">
            You're almost done! Just add your dating start date to generate your invite link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompleteOnboarding} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">When did you start dating?</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !datingStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {datingStartDate ? format(datingStartDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={datingStartDate}
                    onSelect={setDatingStartDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Your invite code</Label>
              <Input
                value={inviteCode}
                readOnly
                className="text-center text-lg font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500">
                This will be your 5-digit invite code
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">What happens next?</p>
              <p>After completing this step, you'll get an invite link that you can share with your partner to connect your accounts!</p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={!datingStartDate || loading}
            >
              {loading ? 'Completing...' : 'Complete Setup & Generate Invite Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
