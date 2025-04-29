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
import { TbLayoutSidebarRightExpand } from "react-icons/tb"
import { useMobile } from "@/hooks/use-mobile"
import { CurrencyDisplay } from "@/components/currency-display"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface TopBarProps {
  onMenuClick: () => void
  isCoursePage?: boolean
  isSidebarCollapsed?: boolean
  onExpandSidebar?: () => void
  courseTitle?: string
}

export function TopBar({
  onMenuClick,
  isCoursePage = false,
  isSidebarCollapsed = false,
  onExpandSidebar,
  courseTitle,
}: TopBarProps) {
  const isMobile = useMobile()
  const pathname = usePathname()
  const [isSmallMobile, setIsSmallMobile] = useState(false)

  // Check if screen is small mobile (below sm breakpoint)
  useEffect(() => {
    const checkSmallMobile = () => {
      setIsSmallMobile(window.innerWidth < 640) // sm breakpoint
    }

    // Initial check
    checkSmallMobile()

    // Add event listener
    window.addEventListener("resize", checkSmallMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkSmallMobile)
  }, [])

  const isLessonPage = pathname.includes("/my-learning/") && pathname.includes("/lessons/")
  const courseProgress = 65
  const derivedCourseTitle = courseTitle || (isCoursePage ? "Python Basics" : "")

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-card">
      <div className="flex items-center">
        {/* Show hamburger menu on mobile and tablet */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        {/* Show expand sidebar button if collapsed in course page - on tablet and desktop */}
        {!isSmallMobile && isCoursePage && isSidebarCollapsed && onExpandSidebar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onExpandSidebar} className="mr-2">
                  <TbLayoutSidebarRightExpand className="h-4 w-4" />
                  <span className="sr-only">Expand course sidebar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand course sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Course title visible on tablet and desktop */}
        {!isSmallMobile && isCoursePage && <h1 className="text-xl font-semibold">{derivedCourseTitle}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Show XP, Coins, Streak when NOT on course page AND not on small mobile */}
        {!isCoursePage && !isSmallMobile && (
          <>
            <CurrencyDisplay type="xp" value={2450} />
            <CurrencyDisplay type="coins" value={750} />
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
              <Image src="/icons/streak.svg" alt="Streak" width={16} height={16} className="h-4 w-4" />
              <span className="text-xs font-medium text-foreground">3</span>
            </div>

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
          </>
        )}

        {/* Course progress bar when on course page AND not on small mobile */}
        {isCoursePage && !isSmallMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${courseProgress}%` }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={courseProgress}
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-500">{courseProgress}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Course progress</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Mode toggle visible on tablet and desktop */}
        {!isSmallMobile && <ModeToggle />}

        {/* Always show profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/avatar.jpeg" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            {/* Show mode toggle in dropdown on small mobile */}
            {isSmallMobile && (
              <DropdownMenuItem asChild>
                <div className="flex w-full items-center">
                  <span className="mr-2">Theme</span>
                  <div className="ml-auto">
                    <ModeToggle />
                  </div>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
