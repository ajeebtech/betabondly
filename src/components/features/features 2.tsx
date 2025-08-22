import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Button as ChakraButton, Box, Flex, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function Features() {
  const features = [
    {
      title: 'Chakra UI',
      description: 'Simple, modular and accessible component library that gives you the building blocks you need to build your React applications.',
      icon: '⚡',
      button: (
        <ChakraButton colorScheme="blue" className="w-full">
          Learn More
        </ChakraButton>
      ),
      highlights: [
        'Accessible components',
        'Dark mode support',
        'Responsive design'
      ]
    },
    {
      title: 'shadcn/ui',
      description: 'Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.',
      icon: '🎨',
      button: (
        <Button className="w-full">
          Get Started
        </Button>
      ),
      highlights: [
        'Copy & paste components',
        'Fully customizable',
        'Built with Radix UI'
      ]
    },
    {
      title: 'Radix UI',
      description: 'Unstyled, accessible components for building high‑quality design systems and web apps in React.',
      icon: '✨',
      button: (
        <Button className="w-full">
          Explore Components
        </Button>
      ),
      highlights: [
        'Unstyled components',
        'Full keyboard navigation',
        'Accessibility built-in'
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose Our UI Components
          </h2>
          <p className="text-muted-foreground">
            Each UI library brings its unique strengths. Here's why you might choose one over the others.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="pt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 mb-6">
                    {feature.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-4">
                    {feature.button}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
