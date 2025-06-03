"use client";

import React from "react";
import {
  Maximize2,
  Minimize2,
  ArrowLeft,
  Shuffle,
  User,
  LogOut,
  Crown,
  Code,
  Compass,
  Play,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { LuShuffle } from "react-icons/lu";
import { LuMaximize } from "react-icons/lu";
import { LuMinimize } from "react-icons/lu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ModeToggle } from "@/components/nexpractice/mode-toggle";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiMenuAlt1 } from "react-icons/hi";
import { useTimeTracking } from '@/app/hooks/useTimeTracking';

interface HeaderProps {
  profilePic: string | null;
  session: any;
  setSidebarOpen: (open: boolean) => void;
  handleFullscreenToggle: () => void;
  isFullscreen: boolean;
  isMobile: boolean;
  runCode: () => void;
  submitCode: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  loadingPhrase: string;
  questionId: string;
}

const Header: React.FC<HeaderProps> = ({
  profilePic,
  session,
  setSidebarOpen,
  handleFullscreenToggle,
  isFullscreen,
  isMobile,
  runCode,
  submitCode,
  isRunning,
  isSubmitting,
  loadingPhrase,
  questionId,
}) => {
  // Keep tracking but don't display
  useTimeTracking({
    problemId: questionId,
    onTimeUpdate: () => {
      // We're not displaying the time anymore
    },
  });

  return (
    <header className="flex items-center justify-between px-4 pt-2 bg-[#f2f3f5] dark:bg-black overflow-hidden min-h-[44px]">
      {/* Left section: Logo, Explore Nex, and sidebar toggle */}
      <div className="flex items-center gap-2 min-w-0 relative z-10">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/nexpractice">
                <button
                  className="bg-[white] border border-[#e4e6eb] dark:border-none dark:bg-[#1f1f1f] p-2 rounded-[8px]"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open questions sidebar"
                >
                  <IoChevronBackOutline />
                </button>
              </Link>
            </TooltipTrigger>

            <TooltipContent>
              <p className="text-xs">Back</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="bg-[white] border border-[#e4e6eb] dark:border-none dark:bg-[#1f1f1f] p-2 rounded-[8px]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open questions sidebar"
              >
                <HiMenuAlt1 className="" />
              </button>
            </TooltipTrigger>

            <TooltipContent>
              <p className="text-xs">Problem Pannel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-1 min-w-0">
          <div className="group min-w-0">
            <h1 className="font-extrabold">NexPractice</h1>
          </div>
        </div>
        {/* Random Challenge button with tooltip and animations */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/nexpractice/problem/random"
                className="bg-[white] border border-[#e4e6eb] dark:border-none dark:bg-[#1f1f1f] p-2 rounded-[8px]"
                onClick={(e) => {
                  e.preventDefault();
                  const icon = e.currentTarget;
                  const mainContent = document.querySelector("main");

                  // Add loading animation to icon
                  icon.classList.add("loading");

                  // Add blur animation to background
                  if (mainContent) {
                    mainContent.classList.add("background-blur");
                  }

                  // Navigate to random problem API endpoint
                  fetch('/api/problem/random')
                    .then(response => {
                      if (response.redirected) {
                        window.location.href = response.url;
                      }
                    })
                    .catch(error => {
                      console.error('Error fetching random problem:', error);
                      // Remove loading animations on error
                      icon.classList.remove("loading");
                      if (mainContent) {
                        mainContent.classList.remove("background-blur");
                      }
                    });
                }}
              >
                <LuShuffle />
              </Link>
            </TooltipTrigger>

            <TooltipContent>
              <p className="text-xs">Random Challenge</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Center section - Time spent */}
      <div className="flex items-center gap-2">
        {/* Time spent display removed */}
      </div>

      {/* Empty space for layout balance in mobile */}
      <div className="md:hidden w-16"></div>

      {/* Right section: Actions/Profile */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="hidden md:flex items-center gap-2 mr-2">
          <a
            href="/explore-nex"
            className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-neutral-800/80 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-normal hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm"
            style={{ fontSize: "0.92rem" }}
          >
            <Compass className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 mr-1" />
            Explore Nex
          </a>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="bg-[white] border border-[#e4e6eb] dark:border-none dark:bg-[#1f1f1f] p-2 rounded-[8px]"
                  onClick={handleFullscreenToggle}
                  aria-label={
                    isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                  }
                >
                  {isFullscreen ? <LuMinimize /> : <LuMaximize />}
                </button>
              </TooltipTrigger>

              <TooltipContent>
                <p className="text-xs">
                  {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Switcher */}
          <ModeToggle />
        </div>

        {/* Profile Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium relative overflow-hidden">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={session?.user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {session?.user?.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-0 border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl overflow-hidden"
            align="end"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-900/20 px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold relative overflow-hidden">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={session?.user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {session?.user?.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {session?.user?.name || "Guest User"}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                    <Crown className="h-3 w-3 mr-1 text-amber-500" />
                    {session?.user?.role === "ADMIN" ? "Admin" : "Student"}
                  </div>
                </div>
              </div>
            </div>
            <div className="py-2">
              <div className="px-2">
                <a
                  href={
                    session?.user?.username
                      ? `/profile/${session.user.username}`
                      : "/profile"
                  }
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-medium">Your Profile</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      View and edit your details
                    </div>
                  </div>
                </a>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-2"></div>
              <div className="px-2">
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors w-full text-left">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Log out of your account
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
