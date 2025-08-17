import { motion } from 'framer-motion';
import { Button } from '@chakra-ui/react';

export default function CTA() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-95"></div>
      <div className="container relative px-4 py-16 md:px-6">
        <motion.div 
          className="mx-auto max-w-4xl rounded-2xl p-8 md:p-12 shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Ready to get started?
            </h2>
            <p className="mb-8 max-w-2xl text-gray-600">
              Join thousands of developers who are already building amazing user interfaces with these powerful UI libraries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                bg="white"
                color="blue.700"
                _hover={{ bg: 'blue.50' }}
              >
                Get Started for Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
