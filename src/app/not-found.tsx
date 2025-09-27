'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            className="w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
