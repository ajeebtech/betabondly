"use client";

import { Box, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion(Box);

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    number: string;
    title: string;
    description: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} py={10} className={className}>
      {items.map((item, idx) => (
        <Box
          key={item.number}
          position="relative"
          p={2}
          h="100%"
          w="100%"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <MotionBox
                as={motion.span}
                position="absolute"
                inset={0}
                h="100%"
                w="100%"
                bg="rgba(236, 72, 153, 0.1)"
                _dark={{ bg: 'rgba(236, 72, 153, 0.2)' }}
                display="block"
                borderRadius="xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardNumber>{item.number}</CardNumber>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export const Card = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      borderRadius="xl"
      h="100%"
      w="100%"
      p={6}
      overflow="hidden"
      position="relative"
      zIndex={20}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        padding: '1px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05))',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }}
      _dark={{
        _before: {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        },
      }}
      backdropFilter="blur(16px) saturate(180%)"
      bg="rgba(255, 255, 255, 0.7)"
      _dark={{
        bg: 'rgba(26, 32, 44, 0.7)',
      }}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.3)"
      _dark={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        _dark: {
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        },
      }}
      transition="all 0.3s ease-in-out"
    >
      <Box position="relative" zIndex={50}>
        <VStack spacing={4} align="start">{children}</VStack>
      </Box>
    </Box>
  );
};

export const CardNumber = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      w={12}
      h={12}
      borderRadius="full"
      bg="rgba(255, 255, 255, 0.8)"
      _dark={{
        bg: 'rgba(255, 255, 255, 0.1)',
        color: 'pink.300',
      }}
      color="pink.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="xl"
      fontWeight="bold"
      mb={6}
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.3)"
      _dark={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
      backdropFilter="blur(8px)"
    >
      {children}
    </Box>
  );
};

export const CardTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Text
      fontSize="xl"
      fontWeight="bold"
      color="gray.900"
      _dark={{ color: 'white' }}
      letterSpacing="normal"
      mb={2}
    >
      {children}
    </Text>
  );
};

export const CardDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Text
      color="gray.600"
      _dark={{ color: 'gray.300' }}
      letterSpacing="normal"
      lineHeight="tall"
      fontSize="md"
    >
      {children}
    </Text>
  );
};
