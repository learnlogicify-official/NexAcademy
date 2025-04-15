'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      {...props}
      defaultTheme="light"
      enableSystem={false}
      attribute="class"
      value={{
        light: 'light',
        dark: 'dark',
      }}
    >
      {children}
    </NextThemesProvider>
  )
}
