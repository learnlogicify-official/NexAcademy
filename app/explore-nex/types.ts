import { LucideIcon } from "lucide-react"

export interface App {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  lightColor: string
  isPro?: boolean
}

export interface AppProps {
  app: App
  index: number
  isHovered: boolean
  isSelected: boolean
  isLoading: boolean
  otherSelected: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}

export interface SelectedAppLoaderProps {
  app: App
  isLoading: boolean
  isExiting?: boolean
}
