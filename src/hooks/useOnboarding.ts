import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, initRecaptcha } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

type OnboardingStep = 'name' | 'phone' | 'verify' | 'profile' | 'complete';

interface OnboardingData {
  name: string;
  preferredName: string;
  phone: string;
  verificationCode: string;
  email: string;
  bio: string;
  profilePicture: File | null;
}

// Helper function to upload profile picture to Firebase Storage
const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
  if (!file) return '';
  
  const storageRef = ref(storage, `profiles/${userId}/${file.name}-${uuidv4()}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Helper function to create a new couple document
const createCouple = async (userId: string) => {
  const coupleId = `couple_${uuidv4()}`;
  const coupleRef = doc(db, 'couples', coupleId);
  
  await setDoc(coupleRef, {
    id: coupleId,
    members: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return coupleId;
};

export const useOnboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    preferredName: '',
    phone: '',
    verificationCode: '',
    email: '',
    bio: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  // Load saved form data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('onboardingData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Only load non-sensitive data
          setFormData(prev => ({
            ...prev,
            name: parsedData.name || '',
            preferredName: parsedData.preferredName || '',
            email: parsedData.email || '',
            bio: parsedData.bio || '',
          }));
        } catch (e) {
          console.error('Failed to parse saved form data', e);
        }
      }
    }

    // Cleanup reCAPTCHA on unmount
    return () => {
      if (typeof window !== 'undefined' && window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.error('Error cleaning up reCAPTCHA:', error);
        }
      }
    };
  }, []);

  const updateFormData = useCallback((updates: Partial<OnboardingData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Persist to localStorage (except for sensitive/volatile data)
      if (typeof window !== 'undefined') {
        const { verificationCode, profilePicture, ...dataToSave } = newData;
        localStorage.setItem('onboardingData', JSON.stringify(dataToSave));
      }
      return newData;
    });
    setError(null);
  }, []);

  const validateStep = (step: OnboardingStep): boolean => {
    switch (step) {
      case 'name':
        if (!formData.name.trim()) {
          setError('Please enter your name');
          return false;
        }
        return true;
      
      case 'phone':
        if (!formData.phone) {
          setError('Please enter your phone number');
          return false;
        }
        if (formData.phone.replace(/\D/g, '').length < 10) {
          setError('Please enter a valid phone number');
          return false;
        }
        return true;
      
      case 'verify':
        if (!formData.verificationCode) {
          setError('Please enter the verification code');
          return false;
        }
        if (formData.verificationCode.length !== 6) {
          setError('Verification code must be 6 digits');
          return false;
        }
        return true;
      
      case 'profile':
        if (!formData.email) {
          setError('Please enter your email');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError(null);

    try {
      switch (currentStep) {
        case 'name':
          setCurrentStep('phone');
          break;
          
        case 'phone': {
          // Ensure we have a valid phone number
          const phoneNumber = formData.phone.startsWith('+') 
            ? formData.phone 
            : `+${formData.phone.replace(/\D/g, '')}`;
            
          if (phoneNumber.length < 10) {
            throw new Error('Please enter a valid phone number');
          }
          
          try {
            // Ensure the reCAPTCHA container exists
            let container = document.getElementById('recaptcha-container');
            if (!container) {
              container = document.createElement('div');
              container.id = 'recaptcha-container';
              container.style.display = 'none'; // Hide the container
              document.body.appendChild(container);
            } else {
              container.innerHTML = ''; // Clear existing content
            }

            // Import auth and initRecaptcha from firebase config
            const { auth, initRecaptcha } = await import('@/lib/firebase');
            
            // Use the centralized reCAPTCHA initialization
            try {
              window.recaptchaVerifier = initRecaptcha('recaptcha-container');
              
              // Render the reCAPTCHA widget
              const widgetId = await window.recaptchaVerifier.render();
              console.log('reCAPTCHA widget rendered with ID:', widgetId);
              
              // Small delay to ensure reCAPTCHA is fully loaded
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.error('Error initializing reCAPTCHA:', error);
              if (window.recaptchaVerifier) {
                try {
                  window.recaptchaVerifier.clear();
                } catch (e) {
                  console.warn('Error clearing reCAPTCHA after error:', e);
                }
                window.recaptchaVerifier = null;
              }
              throw new Error('Failed to initialize security check. Please refresh the page and try again.');
            }
            
            // Send OTP to the user's phone
            const confirmationResult = await signInWithPhoneNumber(
              auth,
              phoneNumber,
              window.recaptchaVerifier
            );
            
            // Store the confirmation result for verification
            window.confirmationResult = confirmationResult;
            
          } catch (error: any) {
            console.error('Phone auth error:', error);
            if (error.code === 'auth/invalid-phone-number') {
              throw new Error('The provided phone number is not valid.');
            } else if (error.code === 'auth/too-many-requests') {
              throw new Error('Too many requests. Please try again later.');
            } else if (error.code === 'auth/invalid-app-credential') {
              throw new Error('Authentication configuration error. Please check your Firebase setup.');
            } else if (error.code === 'auth/missing-app-credential') {
              throw new Error('Authentication credentials missing. Please check your Firebase configuration.');
            } else if (error.code === 'auth/app-not-authorized') {
              throw new Error('This app is not authorized for phone authentication. Please contact support.');
            } else {
              throw new Error(`Failed to send verification code: ${error.message || 'Please try again.'}`);
            }
          }
          setCurrentStep('verify');
          break;
        }
          
        case 'verify': {
          if (!window.confirmationResult) {
            throw new Error('Session expired. Please start the verification process again.');
          }
          
          try {
            // Verify the OTP
            const confirmationResult = window.confirmationResult;
            const result = await confirmationResult.confirm(formData.verificationCode);
            
            // If we reach here, verification was successful
            if (result?.user) {
              // Update the form data with the verified phone number from the result
              updateFormData({ phone: result.user.phoneNumber || formData.phone });
              setCurrentStep('profile');
            } else {
              throw new Error('Verification failed. Please try again.');
            }
          } catch (error: any) {
            console.error('OTP verification error:', error);
            if (error.code === 'auth/invalid-verification-code') {
              throw new Error('Invalid verification code. Please try again.');
            } else if (error.code === 'auth/code-expired') {
              throw new Error('The verification code has expired. Please request a new one.');
            } else if (error.code === 'auth/too-many-requests') {
              throw new Error('Too many attempts. Please try again later.');
            } else {
              throw new Error('Verification failed. Please try again.');
            }
          }
          break;
        }
          
        case 'profile': {
          if (!auth.currentUser) throw new Error('User not authenticated');
          
          // 1. Upload profile picture if provided
          let photoURL = '';
          if (formData.profilePicture) {
            photoURL = await uploadProfilePicture(
              formData.profilePicture,
              auth.currentUser.uid
            );
          }
          
          // 2. Create user profile in Firestore
          const userData = {
            uid: auth.currentUser.uid,
            name: formData.name,
            preferredName: formData.preferredName || formData.name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          // Create a batch to ensure atomic updates
          const batch = {
            set: async (ref: any, data: any, options?: any) => {
              return setDoc(ref, data, options);
            }
          };
          
          // 3. Create a new couple for the user
          const coupleId = await createCouple(auth.currentUser.uid);
          
          // 4. Create/update user document with all data including couple ID
          await batch.set(doc(db, 'users', auth.currentUser.uid), {
            ...userData,
            coupleId,
            updatedAt: serverTimestamp(),
          });
          
          // 5. Update user's display name and photo URL in auth
          if (formData.preferredName || formData.name || photoURL) {
            await updateProfile(auth.currentUser, {
              displayName: formData.preferredName || formData.name || '',
              photoURL: photoURL || undefined,
            });
          }
          
          // 6. Mark onboarding as complete
          setCurrentStep('complete');
          
          // 7. Clear local storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('onboardingData');
          }
          break;
        }
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message.includes('auth/') 
        ? 'Invalid verification code. Please try again.'
        : error.message || 'An error occurred. Please try again.';
      
      setError(errorMessage);
      console.error('Onboarding error:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentStep, formData, recaptchaVerifier]);

  const handleBack = useCallback(() => {
    const steps: OnboardingStep[] = ['name', 'phone', 'verify', 'profile', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return {
    currentStep,
    setCurrentStep,
    formData,
    loading,
    error,
    updateFormData,
    handleNext,
    handleBack,
    handleComplete,
  };
};

export default useOnboarding;
