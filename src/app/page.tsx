'use client';

import { motion } from 'framer-motion';
import { ChakraProvider, Button, Box, Container, Text, VStack, HStack } from '@chakra-ui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import theme from '@/theme';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function RandomDottedBackground({ opacity = 0.08, dotColor = '#d6336c', dotSize = 2 }) {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: '30px 30px',
        opacity: opacity,
        pointerEvents: 'none'
      }}
    />
  );
}

export default function Home() {
  return (
    <ChakraProvider theme={theme}>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
        <Box position="relative" minH="100vh" bgGradient="linear(to-br, #f8f4e8, #f0ece0)" overflow="hidden">
          {/* Paper texture overlay */}
          <Box
            position="absolute"
            inset={0}
            bgImage="url('/textures/old-paper.png')"
            bgSize="cover"
            bgRepeat="repeat"
            opacity={0.2}
            pointerEvents="none"
            zIndex={1}
          />

          {/* Dotted overlay */}
          <RandomDottedBackground />

          {/* Main content */}
          <Box position="relative" zIndex={10} minH="100vh" display="flex" flexDir="column">
            <Box flex={1} display="flex" flexDir="column" alignItems="center" justifyContent="center" p={{ base: 6, md: 8 }}>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                style={{ width: '100%', maxWidth: '64rem', margin: '0 auto' }}
              >
                <VStack spacing={6} textAlign="center">
                  <motion.div variants={fadeInUp}>
                    <Text 
                      fontSize={{ base: '4rem', sm: '5rem', lg: '6rem' }}
                      fontWeight="normal"
                      color="pink.600"
                      fontFamily="var(--font-homemade-apple), cursive"
                      lineHeight={0.9}
                      letterSpacing="normal"
                      textTransform="none"
                    >
                      Bondly
                    </Text>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Text 
                      fontSize={{ base: '1.5rem', md: '1.75rem' }}
                      color="gray.700"
                      fontFamily="'Indie Flower', cursive"
                      maxW="2xl"
                      lineHeight={1.6}
                    >
                      Your private corner of the internet, just for two. Share moments, 
                      memories, and everything in between.
                    </Text>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <HStack spacing={4} mt={8} justifyContent="center" flexWrap="wrap">
                      <Button
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        size="lg"
                        colorScheme="pink"
                        px={8}
                        py={6}
                        fontSize="lg"
                        fontWeight="semibold"
                        borderRadius="full"
                        boxShadow="lg"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl'
                        }}
                        _active={{
                          transform: 'translateY(0)',
                          boxShadow: 'md'
                        }}
                      >
                        get cozy with us
                      </Button>
                      
                      <Button
                        as={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        size="lg"
                        variant="outline"
                        colorScheme="pink"
                        px={8}
                        py={6}
                        fontSize="lg"
                        fontWeight="semibold"
                        borderRadius="full"
                        _hover={{
                          bg: 'rgba(236, 64, 122, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl'
                        }}
                        _active={{
                          transform: 'translateY(0)',
                          boxShadow: 'md'
                        }}
                      >
                        How It Works
                      </Button>
                    </HStack>
                  </motion.div>

                  {/* Decorative elements */}

                </VStack>
              </motion.div>
            </Box>

            <Box py={6} borderTopWidth={1} borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
              <Container maxW="container.xl" textAlign="center">
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  © {new Date().getFullYear()} ajeebtech.
                </Text>
              </Container>
            </Box>
          </Box>
        </Box>
      </NextThemesProvider>
    </ChakraProvider>
  );
}