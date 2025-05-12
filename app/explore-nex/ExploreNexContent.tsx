"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  MessageSquare,
  Play,
  GitBranch,
  Video,
  Code,
  MessageCircle,
  Lightbulb,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Add a global loading state for NexPractice transitions
// This will be used by both the explore page and sidebar navigation
let globalNexPracticeLoadingState = false;
let globalExitAnimationState = false;
let globalExitPosition = { x: 0, y: 0 };
let listeners: Array<() => void> = [];

// Function to notify listeners of state changes
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Add/remove listeners
function addStateChangeListener(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

// Functions to update the global state
export function startNexPracticeLoading() {
  globalNexPracticeLoadingState = true;
  notifyListeners();
}

export function startNexPracticeExitAnimation(position: { x: number, y: number }) {
  globalExitAnimationState = true;
  globalExitPosition = position;
  notifyListeners();
}

export function stopNexPracticeLoading() {
  globalNexPracticeLoadingState = false;
  globalExitAnimationState = false;
  notifyListeners();
}

// Global NexPracticeLoader component that can be mounted anywhere
export function NexPracticeLoader() {
  const [isLoading, setIsLoading] = useState(globalNexPracticeLoadingState);
  const [isAnimatingExit, setIsAnimatingExit] = useState(globalExitAnimationState);
  const [exitPosition, setExitPosition] = useState(globalExitPosition);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  
  useEffect(() => {
    // Set initial app data for NexPractice
    setSelectedApp({
      id: "nexpractice",
      name: "NexPractice",
      description: "Hands-on practice exercises and coding challenges",
      icon: Code,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500",
      lightColor: "#6366F1",
      isPro: true,
    });
    
    // Listen to navigation events
    const onRouteChangeStart = () => {
      setIsLoading(true);
    };

    const onRouteChangeComplete = () => {
      setIsLoading(false);
      setIsAnimatingExit(false);
    };

    // Subscribe to global state changes
    const unsubscribe = addStateChangeListener(() => {
      setIsLoading(globalNexPracticeLoadingState);
      setIsAnimatingExit(globalExitAnimationState);
      setExitPosition(globalExitPosition);
    });

    // Add event listeners for navigation
    window.addEventListener('nexacademy:routeChangeStart', onRouteChangeStart);
    window.addEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete);

    return () => {
      window.removeEventListener('nexacademy:routeChangeStart', onRouteChangeStart);
      window.removeEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete);
      unsubscribe();
    };
  }, []);

  if (!isLoading && !selectedApp) return null;

  return (
    <AnimatePresence>
      {isLoading && selectedApp && (
        <>
          {/* Backdrop blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isAnimatingExit ? 0.2 : 0.5 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-md"
            style={{
              backdropFilter: isAnimatingExit ? "blur(5px)" : "blur(10px)",
              WebkitBackdropFilter: isAnimatingExit ? "blur(5px)" : "blur(10px)"
            }}
          />
          
          {/* Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: isAnimatingExit ? exitPosition.x - 55 : 0, 
              y: isAnimatingExit ? exitPosition.y - 55 : 0, 
              scale: isAnimatingExit ? 0.4 : 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isAnimatingExit ? 0.8 : 0.5,
              ease: "anticipate"
            }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[10000]"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: isAnimatingExit ? "center center" : "center center"
            }}
          >
            <SelectedAppLoader 
              app={selectedApp} 
              isLoading={true}
              isExiting={isAnimatingExit}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ExploreNexContent() {
  const router = useRouter()
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimatingExit, setIsAnimatingExit] = useState(false)
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 })
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const navigationStartTimeRef = useRef<number | null>(null)

  // Listen for navigation events
  useEffect(() => {
    const onRouteChangeStart = () => {
      navigationStartTimeRef.current = Date.now()
      setIsPageTransitioning(true)
    }

    const onRouteChangeComplete = () => {
      setIsPageTransitioning(false)
    }

    // Add event listeners for navigation
    window.addEventListener('nexacademy:routeChangeStart', onRouteChangeStart)
    window.addEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete)

    return () => {
      window.removeEventListener('nexacademy:routeChangeStart', onRouteChangeStart)
      window.removeEventListener('nexacademy:routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  const apps = [
    {
      id: "nexlearn",
      name: "NexLearn",
      description: "Interactive courses and comprehensive learning materials",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500",
      lightColor: "#3B82F6",
    },
    {
      id: "nexforum",
      name: "NexForum",
      description: "Community discussions and knowledge sharing platform",
      icon: MessageSquare,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500",
      lightColor: "#8B5CF6",
    },
    {
      id: "nexplay",
      name: "NexPlay",
      description: "Gamified learning experiences to make education fun",
      icon: Play,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500",
      lightColor: "#22C55E",
    },
    {
      id: "nexpath",
      name: "NexPath",
      description: "Personalized learning paths tailored to your goals",
      icon: GitBranch,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500",
      lightColor: "#F59E0B",
    },
    {
      id: "nexlive",
      name: "NexLive",
      description: "Live classes and interactive webinars with experts",
      icon: Video,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500",
      lightColor: "#EF4444",
    },
    {
      id: "nexpractice",
      name: "NexPractice",
      description: "Hands-on practice exercises and coding challenges",
      icon: Code,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500",
      lightColor: "#6366F1",
      isPro: true,
    },
    {
      id: "nexspeak",
      name: "NexSpeak",
      description: "Language learning and communication skills development",
      icon: MessageCircle,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500",
      lightColor: "#EC4899",
    },
    {
      id: "nexproject",
      name: "NexProject",
      description: "Innovation labs and creative thinking workshops",
      icon: Lightbulb,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-500",
      lightColor: "#06B6D4",
    },
  ]

  // Calculate position of the NexPractice icon in the sidebar
  const calculateSidebarIconPosition = () => {
    // Find the NexPractice icon in the sidebar
    // This targets the specific icon in the sidebar
    const sidebarIcon = document.querySelector('[data-nexapp="nexpractice"]') as HTMLElement
    
    if (sidebarIcon) {
      const rect = sidebarIcon.getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }
    
    // Fallback position (top-left area where sidebar usually is)
    return { 
      x: 50, 
      y: window.innerHeight / 2 
    }
  }

  // Handle app selection and loading animation
  const handleSelect = (appId: string) => {
    if (selectedApp) return
    setSelectedApp(appId)
    setIsLoading(true)

    // For NexPractice, we do a special animation
    if (appId === "nexpractice") {
      // First show loading for 2 seconds
      setTimeout(() => {
        // Dispatch a custom event to notify that route change is about to happen
        window.dispatchEvent(new Event('nexacademy:routeChangeStart'))
        
        // Update global state for potential NexPracticeLoader instances
        startNexPracticeLoading();
        
        // Start the navigation
        const navigationPromise = router.push("/nexpractice")
        
        // After a short delay, calculate the exit position and start exit animation
        setTimeout(() => {
          // Calculate exit position (NexPractice icon in sidebar)
          const position = calculateSidebarIconPosition();
          setExitPosition(position)
          
          // Start exit animation
          setIsAnimatingExit(true)
          
          // Update global exit state
          startNexPracticeExitAnimation(position);
          
          // We don't wait for the navigation promise to complete
          // The exit animation will continue to play until the new page loads
        }, 500) // Small delay before starting exit animation
        
        // After the navigation completes, we'll dispatch a routeChangeComplete event
        // from the nexpractice page
      }, 2000) // Duration of loading animation
    } else {
      // For other apps, just simulate loading
      setTimeout(() => {
        console.log(`Navigating to ${appId}...`)
        // router.push(`/app/${appId}`)
      }, 3000)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden font-sans">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <BackgroundAnimation />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <AnimatePresence>
          {!selectedApp && (
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-10 pb-6 px-4"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center text-center mb-8">
                  {/* Enhanced NexAcademy logo */}
                  <motion.div 
                    className="flex items-center mb-6"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 animate-gradient-slow"></div>
                      
                      {/* Inner circle */}
                      <div className="absolute inset-2 rounded-full bg-gray-900 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                        {/* Light effect */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-30 blur-md"></div>
                        
                        {/* Logo text */}
                        <motion.span 
                          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400"
                          animate={{ 
                            textShadow: ["0 0 8px rgba(101, 120, 248, 0.8)", "0 0 16px rgba(101, 120, 248, 0.4)", "0 0 8px rgba(101, 120, 248, 0.8)"] 
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          N
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">
                        NexAcademy
                      </h1>
                      <div className="h-1 w-24 mt-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
                    </div>
                  </motion.div>
                  
                  {/* Enhanced tagline with better typography */}
                  <motion.p 
                    className="text-gray-300 max-w-md text-lg font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <span className="font-medium text-indigo-300">Elevate your skills</span> with our suite of specialized learning experiences
                  </motion.p>
                </div>

                {/* Decorative line with improved styling */}
                <div className="flex items-center justify-center my-10">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-700 to-transparent"></div>
                  <div className="mx-4 text-xs font-medium tracking-widest text-indigo-400 uppercase">Explore Apps</div>
                  <div className="h-px w-24 bg-gradient-to-l from-transparent via-indigo-700 to-transparent"></div>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* App Icons Grid */}
        <div className="flex-grow flex items-center justify-center px-4 py-4">
          <div className="max-w-6xl w-full mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
              {apps.map((app, index) => (
                <AppIcon
                  key={app.id}
                  app={app}
                  index={index}
                  isHovered={hoveredApp === app.id}
                  isSelected={selectedApp === app.id}
                  isLoading={isLoading && selectedApp === app.id}
                  otherSelected={selectedApp !== null && selectedApp !== app.id}
                  onHover={() => setHoveredApp(app.id)}
                  onLeave={() => setHoveredApp(null)}
                  onSelect={() => handleSelect(app.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <AnimatePresence>
          {!selectedApp && (
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="py-6 text-center"
            >
              <p className="text-gray-500 text-sm">© 2025 NexAcademy. All rights reserved.</p>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed center position for selected app */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: isAnimatingExit ? exitPosition.x - 55 : 0, // Offset for center of icon
              y: isAnimatingExit ? exitPosition.y - 55 : 0, // Offset for center of icon
              scale: isAnimatingExit ? 0.4 : 1
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isAnimatingExit ? 0.8 : 0.5,
              ease: "anticipate"
            }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: isAnimatingExit ? "center center" : "center center"
            }}
          >
            <SelectedAppLoader 
              app={apps.find((a) => a.id === selectedApp)!} 
              isLoading={isLoading || isPageTransitioning} // Keep loading while page is transitioning
              isExiting={isAnimatingExit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface AppProps {
  app: {
    id: string
    name: string
    description: string
    icon: any
    color: string
    bgColor: string
    lightColor: string
    isPro?: boolean
  }
  index: number
  isHovered: boolean
  isSelected: boolean
  isLoading: boolean
  otherSelected: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}

function AppIcon({ app, index, isHovered, isSelected, otherSelected, onHover, onLeave, onSelect }: AppProps) {
  // Get the Icon component from the app
  const Icon = app.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: otherSelected || isSelected ? 0 : 1,
        y: 0,
        transition: {
          delay: index * 0.05,
          duration: 0.5,
        },
      }}
      className="flex flex-col items-center"
    >
      {/* Icon container */}
      <motion.div
        className="relative"
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.div
          className={`relative w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full cursor-pointer overflow-hidden group`}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          onClick={onSelect}
          whileTap={{ scale: 0.95 }}
          data-nexapp={app.id} // Add data attribute for selection 
        >
          {/* Background gradient with animated border */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${app.color}`}
            animate={{
              boxShadow: isHovered ? `0 0 30px 5px ${app.lightColor}40` : "none",
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Animated border */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-0"
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 w-[200%] h-[200%] rounded-full border-2 border-white border-opacity-20"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8, ease: "linear" }}
                    style={{
                      transformOrigin: "center",
                      borderRadius: "40%",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The icon itself */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              animate={{
                scale: isHovered ? 1.3 : 1,
              }}
              transition={{
                scale: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <Icon className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </motion.div>
          </div>

          {/* PRO badge */}
          {app.isPro && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg z-20">
              PRO
            </div>
          )}

          {/* Description tooltip on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-center z-30 pointer-events-none"
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-800"></div>
                <p className="text-xs text-white">{app.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* App name */}
        <div className="mt-4 text-center">
          <h3 className="text-sm md:text-base font-medium text-white">{app.name}</h3>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Selected app loader in the center
function SelectedAppLoader({ app, isLoading, isExiting = false }: { 
  app: AppProps["app"]; 
  isLoading: boolean;
  isExiting?: boolean;
}) {
  const Icon = app.icon

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isExiting ? 0.7 : 1.5, 
          opacity: 1 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        className="relative"
      >
        <div className={`relative w-[110px] h-[110px] rounded-full bg-gradient-to-br ${app.color}`}>
          {/* Animated rings */}
          <motion.div
            className="absolute -inset-8 rounded-full"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
          >
            <div className={`w-full h-full rounded-full ${app.bgColor} opacity-20`}></div>
          </motion.div>

          {/* The icon itself */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: isLoading ? 360 : 0,
              }}
              transition={{
                rotate: { repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "linear" },
              }}
            >
              <Icon className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 rounded-full">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white border-opacity-20 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
              />

              {/* Inner ring */}
              <motion.div
                className="absolute inset-3 rounded-full border-4 border-white border-opacity-40 border-b-transparent"
                animate={{ rotate: -360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "linear" }}
              />

              {/* Loading dots */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white"
                  style={{
                    top: "50%",
                    left: "50%",
                    marginLeft: -4,
                    marginTop: -4,
                    transformOrigin: "center calc(-50% + 4px)",
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* PRO badge */}
          {app.isPro && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg">
              PRO
            </div>
          )}
        </div>
      </motion.div>

      {/* App name and loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isExiting ? 0 : 1, // Hide when exiting
          y: 0
        }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <h3 className="text-xl font-medium text-white mb-2">{app.name}</h3>
        {isLoading && (
          <div className="flex items-center text-blue-400 text-sm">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
            <span className="ml-1">Loading experience</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Animated background component
function BackgroundAnimation() {
  // Use fixed values instead of random ones to avoid hydration issues
  const elements = [
    { size: 120, duration: 180, initialX: 10, initialY: 20, x: 30, y: -30 },
    { size: 90, duration: 150, initialX: 30, initialY: 50, x: -20, y: 40 },
    { size: 140, duration: 200, initialX: 60, initialY: 10, x: 20, y: -40 },
    { size: 110, duration: 170, initialX: 90, initialY: 80, x: -30, y: 20 },
    { size: 130, duration: 190, initialX: 20, initialY: 90, x: 40, y: -10 },
    { size: 80, duration: 160, initialX: 50, initialY: 40, x: -40, y: -30 },
    { size: 100, duration: 140, initialX: 80, initialY: 30, x: 10, y: 40 },
    { size: 70, duration: 130, initialX: 40, initialY: 70, x: -10, y: -20 },
    { size: 150, duration: 210, initialX: 70, initialY: 60, x: 30, y: 10 },
    { size: 85, duration: 155, initialX: 25, initialY: 35, x: -30, y: 30 },
    { size: 125, duration: 185, initialX: 75, initialY: 15, x: 20, y: -30 },
    { size: 95, duration: 165, initialX: 45, initialY: 85, x: -20, y: 10 },
    { size: 135, duration: 195, initialX: 15, initialY: 55, x: 40, y: -20 },
    { size: 75, duration: 145, initialX: 55, initialY: 25, x: -40, y: 40 },
    { size: 115, duration: 175, initialX: 85, initialY: 45, x: 10, y: -10 }
  ]

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Floating elements */}
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-10"
          style={{
            width: el.size,
            height: el.size,
            borderRadius: "40%",
            left: `${el.initialX}%`,
            top: `${el.initialY}%`,
            filter: "blur(40px)",
            backgroundSize: "200% 200%",
          }}
          animate={{
            x: [0, el.x, 0],
            y: [0, el.y, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: el.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}