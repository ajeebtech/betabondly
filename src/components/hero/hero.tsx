import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Button as ChakraButton } from '@chakra-ui/react';
import { Button as RadixButton } from '@radix-ui/themes';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Hero() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="mx-auto max-w-3xl space-y-8 text-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            variants={fadeInUp}
          >
            Unified UI Components Demo
          </motion.h1>
          
          <motion.p 
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            variants={fadeInUp}
          >
            Experience the power of Chakra UI, shadcn/ui, and Radix UI working together in perfect harmony.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            variants={fadeInUp}
          >
            <div className="flex flex-col items-center gap-2">
              <ChakraButton 
                colorScheme="blue" 
                size="lg"
                className="w-full sm:w-auto"
              >
                Chakra Button
              </ChakraButton>
              <span className="text-xs text-muted-foreground">Chakra UI</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" className="w-full sm:w-auto">
                shadcn Button
              </Button>
              <span className="text-xs text-muted-foreground">shadcn/ui</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <RadixButton.Root 
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Radix Button
              </RadixButton.Root>
              <span className="text-xs text-muted-foreground">Radix UI</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
