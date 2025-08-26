'use client'

import { Box } from '@chakra-ui/react';
import { GrainGradient } from '@paper-design/shaders-react';

export default function PrivacyPage() {
  return (
    <Box minH="100vh" w="100vw" position="relative" overflow="hidden">
      <GrainGradient 
        style={{ height: '100vh', width: '100%' }}
        colorBack="hsl(120, 40%, 97%)" // very light greenish-white
        softness={0.7}
        intensity={0.6} // stronger glow
        noise={0.8}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1.1}
        rotation={20}
        speed={2}
        colors={[
          "hsl(140, 70%, 70%)", // fresh mint green
          "hsl(150, 80%, 65%)", // bright green
          "hsl(160, 75%, 60%)", // vibrant aqua-green
          "hsl(120, 60%, 75%)"  // natural leafy green
        ]}
      />
    </Box>
  );
}
