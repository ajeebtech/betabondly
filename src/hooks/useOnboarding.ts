import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { createUser, uploadProfilePicture } from '@/lib/services/userService';
import { createCouple } from '@/lib/services/coupleService';

type OnboardingStep = 'name' | 'phone' | 'verify' | 'profile' | 'complete';

export const useOnboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    phone: '',
    verificationCode: '',
    profilePicture: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const handleNameSubmit = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    setCurrentStep('phone');
    return true;
  };

  const handlePhoneSubmit = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number');
      return false;
    }

    setLoading(true);
    try {
      // This would be replaced with your actual OTP sending logic
      // await sendOTP(formData.phone);
      setCurrentStep('verify');
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setError('Please enter the verification code');
      return false;
    }

    setLoading(true);
    try {
      // This would be replaced with your actual OTP verification logic
      // await verifyOTP(formData.verificationCode);
      setCurrentStep('profile');
      setError(null);
      return true;
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!auth.currentUser) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      let photoURL = '';

      // Upload profile picture if provided
      if (formData.profilePicture) {
        photoURL = await uploadProfilePicture(formData.profilePicture, user.uid);
      }

      // Create user in Firestore
      await createUser({
        uid: user.uid,
        name: formData.name,
        preferredName: formData.preferredName || formData.name,
        phone: formData.phone,
        photoURL,
      });

      // Create a new couple for the user
      const coupleId = await createCouple(user.uid);
      
      // Update user with couple ID
      // await updateCoupleId(user.uid, coupleId);

      setCurrentStep('complete');
      return true;
    } catch (err) {
      setError('Failed to complete profile setup. Please try again.');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    formData,
    loading,
    error,
    updateFormData,
    handleNameSubmit,
    handlePhoneSubmit,
    handleVerifyCode,
    handleProfileSubmit,
    handleComplete,
    goToStep,
  };
};

export default useOnboarding;
