"use client"

import dynamic from 'next/dynamic'
import React from 'react'

// Import just the types from client-sidebar
import type { SidebarProps } from './client-sidebar'

// Dynamically import the Sidebar with SSR disabled
const ClientSidebar = dynamic<SidebarProps>(
  () => import('./client-sidebar').then((mod) => mod.ClientSidebar),
  { ssr: false }
)

// Simple wrapper that re-exports the component with the same props
export function Sidebar(props: SidebarProps) {
  return <ClientSidebar {...props} />
}
