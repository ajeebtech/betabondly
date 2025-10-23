'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { Footer } from '@/components/footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
});

const pricingTiers = [
  {
    name: 'free',
    price: '$0',
    period: 'forever',
    description: 'get a taste of bondly',
    features: [
      '5 media dynamic memory',
      '2x date agent plan calls',
      'access to any 2 mini games',
      'community support',
      '100 tweets in total',
      'basic customization'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    popular: false
  },
  {
    name: 'monthly',
    price: '$4.99',
    period: 'per month',
    description: 'for those who want more',
    features: [
      'everything in free',
      'more media slots',
      'more mini games',
      ' more access to AI features',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'primary',
    popular: false
  },
  {
    name: '6 months',
    price: '$19.99',
    period: 'every 6 months',
    description: 'Best value - Save 50%',
    features: [
      'Everything in monthly',
      'text chat',
      'monthly wrapped',
      'more agents',
      'messaging'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'primary',
    popular: true
  },
  {
    name: 'annual',
    price: '$39.99',
    period: 'per year',
    description: 'Best for long-term users',
    features: [
      'Everything in the 6 months plan',
      'messaging'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'primary',
    popular: false
  }
];

export default function PremiumPage() {
  const [selectedTier, setSelectedTier] = useState('6 Months');

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
  };

  return (
    <>
      <div className="min-h-screen bg-base-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              className={`${playfair.className} text-4xl font-bold text-gray-900 mb-4`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Choose Your Plan
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              select the plan that works best for you and your relationship journey.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                className={`relative rounded-2xl border-2 ${
                  'border-gray-200 hover:border-pink-300'
                } bg-white overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{tier.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-500 ml-2">{tier.period}</span>
                  </div>
                  
                  {tier.name !== 'free' && (
                    <div className="w-full mb-6">
                      <RainbowButton 
                        variant="default"
                        size="lg"
                        className="w-full"
                      >
                        {tier.buttonText}
                      </RainbowButton>
                    </div>
                  )}
                  
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg 
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
