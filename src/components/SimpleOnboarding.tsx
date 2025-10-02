'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { toast } from 'sonner';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface UserInfo {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  phone?: string;
}

export function SimpleOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [bio, setBio] = useState('');
  const [preferredName, setPreferredName] = useState('');

  const handleGoogleSignIn = async (userInfo: UserInfo) => {
    setUser(userInfo);
    setPreferredName(userInfo.name);
  };

  const handleCompleteProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Create user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.name,
        preferredName: preferredName || user.name,
        email: user.email,
        phone: user.phone || '',
        bio: bio,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create a couple for the user
      const coupleId = `couple_${uuidv4()}`;
      const coupleRef = doc(db, 'couples', coupleId);
      await setDoc(coupleRef, {
        id: coupleId,
        members: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update user with couple ID
      await setDoc(userRef, {
        coupleId,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast.success('Welcome to Bondly! 🎉');
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/pinkbonddd.png"
                alt="Bondly Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                welcome to bondly
              </h1>
              <p className="text-gray-600 text-lg">
                just you both
              </p>
            </div>
          </div>

          {/* Sign In Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <GoogleSignInButton 
                  onSuccess={handleGoogleSignIn}
                  className="w-full"
                >
                  Continue with Google
                </GoogleSignInButton>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Quick & Secure</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="/privacy" className="text-rose-600 hover:text-rose-700 underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms" className="text-rose-600 hover:text-rose-700 underline">
                    Terms of Service
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No phone verification needed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
          <div className="w-8 h-0.5 bg-rose-400"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Almost there!</h1>
          <p className="text-gray-600">Just a few more details to personalize your experience</p>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center mt-1">
                  <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">Connected with Google</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredName" className="text-sm font-medium text-gray-700">
                  What should we call you?
                </Label>
                <Input
                  id="preferredName"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="Enter your preferred name"
                  className="h-11 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Tell us about yourself <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Share a bit about yourself, your interests, or what you're looking for..."
                  rows={3}
                  className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 resize-none"
                />
                <p className="text-xs text-gray-500">{bio.length}/200 characters</p>
              </div>
            </div>

            {/* Complete Button */}
            <Button 
              onClick={handleCompleteProfile}
              disabled={loading || !preferredName.trim()}
              className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Setting up your account...</span>
                </div>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            You can always update these details later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
