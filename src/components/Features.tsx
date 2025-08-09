'use client';

import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Chakra UI',
    description: 'Simple, modular and accessible component library for React',
    buttonText: 'Chakra Button',
    buttonVariant: 'solid' as const,
    colorScheme: 'blue' as const,
    icon: '⚡'
  },
  {
    title: 'shadcn/ui',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS',
    buttonText: 'shadcn Button',
    buttonVariant: 'outline' as const,
    className: 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30',
    icon: '✨'
  },
  {
    title: 'Radix UI',
    description: 'Unstyled, accessible components for building high‑quality design systems',
    buttonText: 'Radix Button',
    buttonVariant: 'ghost' as const,
    className: 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30',
    icon: '🎨'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Featured UI Libraries</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore the power of modern UI libraries working together seamlessly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {feature.description}
              </p>
              <Button 
                colorScheme={feature.colorScheme}
                variant={feature.buttonVariant}
                className={feature.className}
                width="full"
              >
                {feature.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
