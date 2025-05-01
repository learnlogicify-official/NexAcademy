"use client";

import { Menu, Bell, User, Search, LogOut, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState } from "react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5 text-primary/80" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          {/* Empty flex-grow div to push actions to the right */}
          <div className="flex-1"></div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="p-1 bg-primary/5 rounded-lg">
              <ThemeSwitcher />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative border-primary/20 bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-primary/80" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm text-[10px] font-medium text-primary-foreground animate-pulse">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
                    <span>2</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] border-primary/20 shadow-lg" onClick={e => e.stopPropagation()}>
                <DropdownMenuLabel className="font-semibold text-lg py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary"/>
                      Notifications
                    </span>
                    <span className="bg-primary/10 text-primary text-xs font-medium py-1 px-2 rounded-full">2 new</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[320px] overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 hover:bg-muted/50 focus:bg-muted/50 cursor-pointer">
                    <div className="flex w-full items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-2 shadow-sm">
                        <User className="h-4 w-4 text-primary" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center">
                          New User Registration
                          <span className="ml-2 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">New</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          John Doe has registered as a new student
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs font-normal hover:bg-primary/10">Mark as Read</Button>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 hover:bg-muted/50 focus:bg-muted/50 cursor-pointer">
                    <div className="flex w-full items-start gap-2">
                      <span className="rounded-full bg-primary/10 p-2 shadow-sm">
                        <Bell className="h-4 w-4 text-primary" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center">
                          Course Update Required
                          <span className="ml-2 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">New</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          "Advanced React" course needs content update
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs font-normal hover:bg-primary/10">Mark as Read</Button>
                    </div>
                  </DropdownMenuItem>
                </div>
                <div className="p-3 border-t">
                  <Button variant="outline" size="sm" className="w-full border-primary/20 bg-muted/30 hover:bg-primary/10 hover:border-primary/30">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 p-0 hover:border-primary/40 transition-colors shadow-sm"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 border-primary/20 shadow-lg" onClick={e => e.stopPropagation()}>
                <DropdownMenuLabel className="font-normal px-4 py-3">
                  <div className="flex flex-col">
                    <p className="font-semibold text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Admin</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-muted/50 focus:bg-muted/50 cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/dashboard"} className="hover:bg-muted/50 focus:bg-muted/50 cursor-pointer">
                  <ArrowRightLeft className="mr-2 h-4 w-4 text-primary" />
                  <span>Switch to Student Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={isSigningOut} onClick={handleSignOut} className="hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
} 