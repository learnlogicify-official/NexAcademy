"use client"

import { SnackbarProvider } from "notistack"

export function NotistackProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      autoHideDuration={3000}
    >
      {children}
    </SnackbarProvider>
  )
} 