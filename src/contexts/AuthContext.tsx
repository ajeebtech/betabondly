'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type OnboardingData = {
  name: string;
  phone: string;
  datingStartDate: string;
};

type AuthContextType = {
  // Auth state
  user: FirebaseUser | null;
  loading: boolean;
  
  // Onboarding state
  name: string;
  phone: string;
  datingStartDate: string;
  
  // Methods
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setDatingStartDate: (date: string) => void;
  setUser: (user: FirebaseUser | null) => void;
  clearOnboarding: () => void;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  // Auth state
  user: null,
  loading: true,
  
  // Onboarding state
  name: '',
  phone: '',
  datingStartDate: '',
  
  // Methods
  setName: () => {},
  setPhone: () => {},
  setDatingStartDate: () => {},
  setUser: () => {},
  clearOnboarding: () => {},
  refreshToken: async () => false,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    phone: '',
    datingStartDate: '',
  });

  // Handle auth state changes with automatic token refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Force refresh the token to ensure it's valid
          await user.getIdToken(true);
          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
          // If token refresh fails, the user might need to re-authenticate
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set onboarding name
  const setName = (name: string) => {
    setOnboardingData(prev => ({ ...prev, name }));
  };

  // Set onboarding phone
  const setPhone = (phone: string) => {
    setOnboardingData(prev => ({ ...prev, phone }));
  };

  // Set dating start date
  const setDatingStartDate = (datingStartDate: string) => {
    setOnboardingData(prev => ({ ...prev, datingStartDate }));
  };

  // Update user in context
  const updateUser = (user: FirebaseUser | null) => {
    setUser(user);
  };

  // Clear onboarding data
  const clearOnboarding = () => {
    setOnboardingData({ name: '', phone: '', datingStartDate: '' });
  };

  // Manual token refresh function
  const refreshToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await user.getIdToken(true);
      console.log('✅ Manual token refresh successful');
      return true;
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        name: onboardingData.name,
        phone: onboardingData.phone,
        datingStartDate: onboardingData.datingStartDate,
        setName,
        setPhone,
        setDatingStartDate,
        setUser: updateUser,
        clearOnboarding,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
