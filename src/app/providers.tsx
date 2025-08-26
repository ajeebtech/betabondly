'use client';

import { createContext, useContext, useState } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '../theme';

const AppContext = createContext<any>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AppContext.Provider
        value={{
          isConnected,
          setIsConnected,
          userAddress,
          setUserAddress,
          isLoading,
          setIsLoading,
          error,
          setError,
        }}
      >
        {children}
      </AppContext.Provider>
    </ChakraProvider>
  );
}

export const useAppContext = () => useContext(AppContext);
