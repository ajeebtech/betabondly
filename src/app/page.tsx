'use client'

import { Button, Box, Container, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Navbar */}
      <Box 
        as="nav" 
        w="100%" 
        py={{ base: 3, md: 4 }} 
        px={{ base: 4, md: 8 }} 
        bg="white" 
        boxShadow="sm" 
        position="fixed" 
        top={0}
        left={0}
        right={0}
        zIndex="sticky"
      >
        <Container 
          maxW="container.xl" 
          display="flex" 
          justifyContent={{ base: 'center', md: 'flex-end' }}
          alignItems="center"
        >
          <Button 
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('get-started')}
            colorScheme="pink" 
            size={{ base: 'md', md: 'lg' }}
            bg="pink.400" 
            _hover={{ 
              bg: 'pink.500',
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            color="white"
            px={6}
            py={2}
            borderRadius="full"
            fontWeight="semibold"
            boxShadow="md"
          >
            your page
          </Button>
        </Container>
      </Box>

      {/* Hero Section - Full Viewport Height */}
      <Box 
        as="main" 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        pt={16} // Account for fixed navbar
        pb={20}
      >
        <Container maxW="container.xl">
          <VStack
            as={motion.div}
            initial="hidden"
            animate="show"
            variants={stagger}
            spacing={8}
            w="100%"
            textAlign="center"
            justifyContent="center"
            minH={{ base: 'calc(100vh - 80px)', md: 'calc(100vh - 100px)' }}
          >
            <Text
              as={motion.p}
              variants={fadeUp}
              fontSize={{ base: '4.5rem', sm: '6rem', md: '8rem' }}
              fontWeight="bold"
              color="pink.300"
              lineHeight={1}
              letterSpacing="tighter"
            >
              bondly.
            </Text>
            
            <Text 
              as={motion.p} 
              variants={fadeUp} 
              fontSize={{ base: 'xl', md: '2xl' }} 
              color="gray.600"
              maxW="2xl"
              mx="auto"
              px={4}
            >
              your little corner of the internet, just for two.
            </Text>
            
            <HStack 
              as={motion.div} 
              variants={fadeUp} 
              spacing={6} 
              pt={4}
              flexWrap="wrap"
              justifyContent="center"
            >
              <Button 
                colorScheme="pink" 
                size="lg" 
                bg="pink.400" 
                _hover={{ bg: 'pink.500' }} 
                color="white"
                onClick={() => scrollToSection('get-started')}
                px={8}
                py={6}
                fontSize="lg"
              >
                get started
              </Button>
              <Button variant="outline" size="lg">
                learn more
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Additional sections for scrolling */}
      <Box id="features" py={20} bg="white">
        <Container maxW="container.lg">
          <VStack spacing={12} textAlign="center">
            <motion.div variants={fadeUp}>
              <Text fontSize="4xl" fontWeight="bold" color="gray.800" mb={4}>
                we're bringing back chalant long-distance dating to this generation.
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                A beautiful, private corner of the internet designed just for you and your special someone to share memories, thoughts, and moments.
              </Text>
            </motion.div>

            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} w="100%">
              {[
                { title: 'Private', desc: 'Your space is just for the two of you, no distractions.' },
                { title: 'Beautiful', desc: 'Clean, modern design that puts your content first.' },
                { title: 'Easy to Use', desc: 'Simple and intuitive interface that just works.' }
              ].map((feature, index) => (
                <motion.div key={feature.title} variants={fadeUp} custom={index}>
                  <Box p={6} bg="gray.50" borderRadius="lg" height="100%">
                    <Text fontSize="xl" fontWeight="bold" mb={3} color="pink.400">{feature.title}</Text>
                    <Text color="gray.600">{feature.desc}</Text>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </VStack>
        </Container>
      </Box>

      <Box py={20} bg="gray.50">
        <Container maxW="container.lg">
          <VStack spacing={8} textAlign="center">
            <motion.div variants={fadeUp}>
              <Text fontSize="4xl" fontWeight="bold" color="gray.800" mb={4}>
                How It Works
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                Getting started is simple and takes just a few minutes.
              </Text>
            </motion.div>

            <VStack spacing={12} align="stretch" w="100%" maxW="3xl" mx="auto">
              {[
                { number: '1', title: 'Sign Up', desc: 'Create your account in seconds.' },
                { number: '2', title: 'Invite Your Partner', desc: 'Send an invite to your special someone.' },
                { number: '3', title: 'Start Sharing', desc: 'Begin your private journey together.' }
              ].map((step, index) => (
                <motion.div key={step.number} variants={fadeUp} custom={index}>
                  <HStack spacing={6} align="start" bg="white" p={6} borderRadius="lg" boxShadow="sm">
                    <Box 
                      bg="pink.100" 
                      color="pink.600" 
                      w={10} 
                      h={10} 
                      borderRadius="full" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                      fontSize="lg"
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      {step.number}
                    </Box>
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={1}>{step.title}</Text>
                      <Text color="gray.600">{step.desc}</Text>
                    </Box>
                  </HStack>
                </motion.div>
              ))}
            </VStack>
          </VStack>
        </Container>
      </Box>

      <Box py={20} bg="white" id="contact">
        <Container maxW="container.md" textAlign="center">
          <motion.div variants={fadeUp}>
            <Text fontSize="4xl" fontWeight="bold" color="gray.800" mb={6}>
              Ready to Get Started?
            </Text>
            <Text fontSize="lg" color="gray.600" mb={10} maxW="xl" mx="auto">
              Join thousands of couples who are already creating their private corner of the internet.
            </Text>
            <Button 
              colorScheme="pink" 
              size="lg" 
              bg="pink.400" 
              _hover={{ bg: 'pink.500' }} 
              color="white"
              px={8}
              py={6}
              fontSize="lg"
              onClick={() => scrollToSection('get-started')}
            >
              Create Your Space Now
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Box py={6} borderTopWidth={1} borderColor="gray.200">
        <Container maxW="container.xl" textAlign="center">
          <Text
            as={motion.p}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            fontSize="sm"
            color="gray.500"
          >
            © {new Date().getFullYear()} ajeebtech
          </Text>
        </Container>
      </Box>
    </Box>
  )
}