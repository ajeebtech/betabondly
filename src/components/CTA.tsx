'use client';

import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to build something amazing?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers who are already creating beautiful user interfaces with these powerful tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              colorScheme="whiteAlpha"
              className="w-full sm:w-auto"
              _hover={{
                bg: 'white',
                color: 'blue.600',
              }}
            >
              Get Started for Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              colorScheme="whiteAlpha"
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
