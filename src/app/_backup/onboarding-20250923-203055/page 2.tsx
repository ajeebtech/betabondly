"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = {
  id: number;
  title: string;
  component: React.ReactNode;
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const steps: Step[] = [
    {
      id: 1,
      title: 'Welcome',
      component: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Bondly</h2>
          <p className="text-gray-600 mb-8">Let's get you started on your journey to better bonding experiences.</p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Preferences',
      component: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Preferences</h2>
          <p className="text-gray-600 mb-8">Tell us what kind of experiences you enjoy.</p>
          {/* Add your preferences form here */}
        </div>
      ),
    },
    {
      id: 3,
      title: 'Connect',
      component: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect with Friends</h2>
          <p className="text-gray-600 mb-8">Find and connect with friends to plan your next adventure.</p>
          {/* Add connection options here */}
        </div>
      ),
    },
    {
      id: 4,
      title: 'Complete',
      component: (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
          <p className="text-gray-600 mb-8">Start exploring and creating amazing experiences.</p>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard'); // Redirect to dashboard when done
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length;
  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Progress Steps */}
        <ul className="steps steps-vertical lg:steps-horizontal w-full mb-12">
          {steps.map((step) => (
            <li 
              key={step.id} 
              className={cn(
                'step',
                currentStep > step.id && 'step-primary',
                currentStep === step.id && 'step-primary font-medium'
              )}
            >
              {step.title}
            </li>
          ))}
        </ul>

        {/* Step Content */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm"
        >
          {currentStepData?.component}
          
          <div className="mt-8 flex gap-4">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="min-w-[100px]"
              >
                Back
              </Button>
            )}
            
            <Button 
              onClick={nextStep}
              className="min-w-[100px] bg-pink-500 hover:bg-pink-600"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
