'use client';

import { createContext, useContext } from 'react';

const AppContext = createContext({});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
