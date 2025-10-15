// src/components/TokenRefreshButton.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function TokenRefreshButton() {
  const [refreshing, setRefreshing] = useState(false);
  const { refreshToken } = useAuth();

  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      const success = await refreshToken();
      
      if (success) {
        toast.success('Token refreshed successfully!');
        // Reload the page to ensure all components use the fresh token
        window.location.reload();
      } else {
        toast.error('Token refresh failed. Please sign in again.');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error('Token refresh failed. Please sign in again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={refreshing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      {refreshing ? 'Refreshing...' : 'Refresh Token'}
    </Button>
  );
}
