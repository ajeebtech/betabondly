"use client"

import { TamaguiProvider as TamaguiProviderBase } from 'tamagui'
import config from '../../tamagui.config'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProviderBase config={config} defaultTheme="light">
      {children}
    </TamaguiProviderBase>
  )
}
