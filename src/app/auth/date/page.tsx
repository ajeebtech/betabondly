"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function DateStep() {
  const router = useRouter();
  const { datingStartDate, setDatingStartDate } = useAuth();
  const [date, setDate] = useState(datingStartDate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      setDatingStartDate(date);
      router.push("/auth/photo");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">When did you start dating?</CardTitle>
          <CardDescription className="text-center">
            This helps us personalize your experience!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="datingStartDate">Dating Start Date</Label>
              <Input
                id="datingStartDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
