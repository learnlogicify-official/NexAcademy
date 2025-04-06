"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, LogOut, Settings, User } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Role } from "@/lib/validations/role"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const isMobile = useMobile()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: session } = useSession()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false })
      router.push("/auth/signin?success=signed_out")
    } finally {
      setIsSigningOut(false)
    }
  }

  // Get the first character of the user's name or email
  const getInitials = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase()
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Format role for display
  const formatRole = (role: Role) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase().replace(/_/g, " ")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 bg-card">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
          <div className="text-xs font-medium">Level 12</div>
          <div className="text-xs text-muted-foreground">2400 XP</div>
        </div>

        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New course available: Advanced React</DropdownMenuItem>
            <DropdownMenuItem>Assignment due tomorrow</DropdownMenuItem>
            <DropdownMenuItem>You earned a new badge!</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{session?.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{session?.user?.email}</p>
                <p className="text-xs leading-none text-primary font-medium truncate">
                  {session?.user?.role ? formatRole(session.user.role) : "Student"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

