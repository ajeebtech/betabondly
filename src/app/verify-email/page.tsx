"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    setChecking(true);
    setError("");
    try {
      await user?.reload();
      if (user?.emailVerified) {
        router.push("/auth/date");
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }
    } catch (err) {
      setError("Failed to check verification status.");
    }
    setChecking(false);
  };

  useEffect(() => {
    if (user?.emailVerified) {
      router.push("/auth/date");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We’ve sent a verification link to <b>{user?.email}</b>.<br />
            Please check your inbox and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} className="w-full" disabled={checking}>
            {checking ? "Checking..." : "I've Verified My Email"}
          </Button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}


