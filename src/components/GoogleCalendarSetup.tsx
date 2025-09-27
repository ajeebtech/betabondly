'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, CheckCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface GoogleCalendarSetupProps {
  onSuccess?: () => void;
  onSkip?: () => void;
}

export function GoogleCalendarSetup({ onSuccess, onSkip }: GoogleCalendarSetupProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Start the OAuth flow
      const response = await fetch('/api/google/oauth/url');
      const { url } = await response.json();
      
      // Open the Google OAuth consent screen in a popup
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const authWindow = window.open(
        url,
        'Google OAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
      
      // Check for OAuth completion
      const checkAuth = setInterval(async () => {
        if (authWindow?.closed) {
          clearInterval(checkAuth);
          try {
            const statusResponse = await fetch('/api/google/status');
            const { connected: isConnected } = await statusResponse.json();
            
            if (isConnected) {
              setConnected(true);
              onSuccess?.();
            } else {
              setError('Failed to connect Google Calendar. Please try again.');
            }
          } catch (err) {
            console.error('Error checking auth status:', err);
            setError('Failed to verify Google Calendar connection.');
          } finally {
            setLoading(false);
          }
        }
      }, 500);
      
    } catch (err) {
      console.error('Error starting OAuth flow:', err);
      setError('Failed to start Google OAuth. Please try again.');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onSuccess?.();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect Google Calendar</h2>
        <p className="mt-2 text-sm text-gray-600">
          Connect your Google Calendar to schedule and manage dates seamlessly.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {!connected ? (
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                Connect with Google
              </>
            )}
          </Button>
        ) : (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Google Calendar connected successfully!
          </div>
        )}

        <Button
          onClick={onSkip || handleContinue}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {connected ? 'Continue' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
}
