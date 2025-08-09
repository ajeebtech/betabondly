'use client';

import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Beautiful UI Components
            <span className="text-blue-600 dark:text-blue-400 block mt-2">
              For Modern Web Apps
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Experience the power of top UI libraries working together in perfect harmony.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              colorScheme="blue" 
              size="lg"
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
