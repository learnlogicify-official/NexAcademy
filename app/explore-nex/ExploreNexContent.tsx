"use client"

import { useState, useEffect, useRef } from "react"
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
  Sun,
  Moon,
  ChevronLeft,
  Info,
  ArrowRight,
  Compass,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
// Remove this line: import { setTheme, theme } from "@/utils/theme"

// Global state management for NexPractice transitions
let globalNexPracticeLoadingState = false
let globalExitAnimationState = false
let globalExitPosition = { x: 0, y: 0 }
let listeners: Array<() => void> = []

// Function to notify listeners of state changes
function notifyListeners() {
  listeners.forEach((listener) => listener())
}

// Add/remove listeners
function addStateChangeListener(callback: () => void) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

// Functions to update the global state
export function startNexPracticeLoading() {
  globalNexPracticeLoadingState = true
  notifyListeners()
}

export function startNexPracticeExitAnimation(position: { x: number; y: number }) {
  globalExitAnimationState = true
  globalExitPosition = position
  notifyListeners()
}

export function stopNexPracticeLoading() {
  globalNexPracticeLoadingState = false
  globalExitAnimationState = false
  notifyListeners()
}

// Global NexPracticeLoader component that can be mounted anywhere
export function NexPracticeLoader() {
  const [isLoading, setIsLoading] = useState(globalNexPracticeLoadingState)
  const [isAnimatingExit, setIsAnimatingExit] = useState(globalExitAnimationState)
  const [exitPosition, setExitPosition] = useState(globalExitPosition)
  const [selectedApp, setSelectedApp] = useState<any>(null)

  useEffect(() => {
    // Set initial app data for NexPractice
    setSelectedApp({
      id: "nexpractice",
      name: "NexPractice",
      description: "Hands-on practice exercises and coding challenges",
      icon: Code,
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-600",
      lightColor: "#2563eb",
      isPro: true,
    })

    // Listen to navigation events
    const onRouteChangeStart = () => {
      setIsLoading(true)
    }

    const onRouteChangeComplete = () => {
      // Stop the loading animation when navigation completes
      stopNexPracticeLoading()
      setIsLoading(false)
      setIsAnimatingExit(false)
    }

    // Also listen for window load event to handle cases when navigation is complete
    const handleWindowLoad = () => {
      if (window.location.pathname === '/nexpractice') {
        stopNexPracticeLoading()
        setIsLoading(false)
        setIsAnimatingExit(false)
      }
    }

    // Subscribe to global state changes
    const unsubscribe = addStateChangeListener(() => {
      setIsLoading(globalNexPracticeLoadingState)
      setIsAnimatingExit(globalExitAnimationState)
      setExitPosition(globalExitPosition)
    })

    // Add event listeners for navigation
    window.addEventListener("nexacademy:routeChangeStart", onRouteChangeStart)
    window.addEventListener("nexacademy:routeChangeComplete", onRouteChangeComplete)
    window.addEventListener('load', handleWindowLoad)
    
    // Check immediately if we're already on the nexpractice page
    if (window.location.pathname === '/nexpractice') {
      stopNexPracticeLoading()
    }

    return () => {
      window.removeEventListener("nexacademy:routeChangeStart", onRouteChangeStart)
      window.removeEventListener("nexacademy:routeChangeComplete", onRouteChangeComplete)
      window.removeEventListener('load', handleWindowLoad)
      unsubscribe()
    }
  }, [])

  if (!isLoading && !selectedApp) return null

  return (
    <AnimatePresence>
      {isLoading && selectedApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-[10000] bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm"
        >
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800 opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 dark:border-blue-400 animate-spin"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add the HeroSlider component
function HeroSlider({ apps, onSelect }: { apps: AppProps["app"][]; onSelect: (appId: string) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const totalSlides = apps.length

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 6000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current)
      }
    }
  }, [currentSlide, isAutoPlaying, totalSlides])

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
    setIsHovering(false)
  }

  // Navigation functions
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const currentApp = apps[currentSlide]
  const Icon = currentApp.icon

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl mb-4"
      style={{ height: "380px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background gradient with app color */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${currentApp.color} opacity-90`}></div>

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect width="80" height="80" fill="url(#smallGrid)" />
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating circles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Particle effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * -100 - 50],
                  x: [0, (Math.random() - 0.5) * 50],
                  opacity: [0, 0.8, 0],
                  scale: [0, Math.random() * 2 + 1, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-center">
        {/* App Icon */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-8">
          <motion.div
            key={`icon-${currentSlide}`}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-36 h-36 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
              <div className={`absolute inset-2 rounded-full ${currentApp.bgColor} flex items-center justify-center`}>
                <Icon className="h-18 w-18 text-white" />
              </div>

              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
              >
                <div className="w-full h-full rounded-full border-4 border-white/30"></div>
              </motion.div>

              <motion.div
                className="absolute -inset-4 rounded-full"
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-full h-full rounded-full border-2 border-white/20"></div>
              </motion.div>

              {/* Orbiting elements */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-6 h-6 rounded-full bg-white/30 flex items-center justify-center"
                  style={{
                    top: "50%",
                    left: "50%",
                    marginLeft: -12,
                    marginTop: -12,
                    transformOrigin: "center calc(-50% - 100px)",
                  }}
                  animate={{
                    rotate: [i * 120, i * 120 + 360],
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                </motion.div>
              ))}

              {/* PRO badge */}
              {currentApp.isPro && (
                <motion.div
                  className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full text-sm font-bold text-white shadow-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  PRO
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* App Info */}
        <div className="w-full md:w-1/2 p-3 md:p-4 text-white">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <div>
              <motion.div
                className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {currentApp.category.charAt(0).toUpperCase() + currentApp.category.slice(1)}
              </motion.div>
              <h2 className="text-2xl md:text-4xl font-bold">{currentApp.name}</h2>
            </div>

            <p className="text-base md:text-lg text-white/90 max-w-lg">{currentApp.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {Object.entries(currentApp.stats).map(([key, value], index) => (
                <motion.div
                  key={key}
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-sm text-white/70 capitalize">{key}</div>
                  <div className="text-xl font-bold">{value}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex space-x-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onSelect(currentApp.id)}
                  className="bg-white text-slate-900 hover:bg-white/90 px-6 py-6 h-12 rounded-full shadow-lg"
                >
                  Explore {currentApp.name}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  className="flex items-center justify-center border border-white bg-white/10 backdrop-blur-sm text-slate-800 dark:text-white px-6 py-2 h-12 rounded-full hover:bg-white/20 transition-all"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                >
                  <Info className="mr-2 h-5 w-5" />
                  Learn More
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <motion.button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/50 transition-all z-20"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="h-6 w-6" />
      </motion.button>

      <motion.button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/50 transition-all z-20"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="h-6 w-6" />
      </motion.button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {apps.map((app, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2.5"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={index === currentSlide ? { width: 32 } : { width: 10 }}
            animate={
              index === currentSlide
                ? { width: 32, backgroundColor: "rgba(255, 255, 255, 1)" }
                : { width: 10, backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* App name overlay at bottom */}
    </div>
  )
}

export default function ExploreNexContent() {
  const router = useRouter()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [isAnimatingExit, setIsAnimatingExit] = useState(globalExitAnimationState)
  const [exitPosition, setExitPosition] = useState(globalExitPosition)
  const navigationStartTimeRef = useRef<number | null>(null)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

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
    window.addEventListener("nexacademy:routeChangeStart", onRouteChangeStart)
    window.addEventListener("nexacademy:routeChangeComplete", onRouteChangeComplete)

    return () => {
      window.removeEventListener("nexacademy:routeChangeStart", onRouteChangeStart)
      window.removeEventListener("nexacademy:routeChangeComplete", onRouteChangeComplete)
    }
  }, [])

  // Update the apps array with the correct colors from the image
  const apps = [
    {
      id: "nexlearn",
      name: "NexLearn",
      description: "Interactive courses and comprehensive learning materials",
      icon: BookOpen,
      color: "from-[#4285F4] to-[#5B9AF5]",
      bgColor: "bg-[#4285F4]",
      lightColor: "#4285F4",
      category: "learning",
      stats: {
        courses: 120,
        students: "12.5K",
        rating: 4.8,
      },
    },
    {
      id: "nexconnect",
      name: "NexConnect",
      description: "Community discussions and knowledge sharing platform",
      icon: MessageSquare,
      color: "from-[#9C5DE4] to-[#AB7AE8]",
      bgColor: "bg-[#9C5DE4]",
      lightColor: "#9C5DE4",
      category: "community",
      stats: {
        threads: 8500,
        users: "25K",
        responses: "98K",
      },
    },
    {
      id: "nexplay",
      name: "NexPlay",
      description: "Gamified learning experiences to make education fun",
      icon: Play,
      color: "from-[#4CAF50] to-[#66BB6A]",
      bgColor: "bg-[#4CAF50]",
      lightColor: "#4CAF50",
      category: "learning",
      stats: {
        games: 45,
        players: "8.2K",
        challenges: 320,
      },
    },
    {
      id: "nexpath",
      name: "NexPath",
      description: "Personalized learning paths tailored to your goals",
      icon: GitBranch,
      color: "from-[#F5A623] to-[#F7B84B]",
      bgColor: "bg-[#F5A623]",
      lightColor: "#F5A623",
      category: "learning",
      stats: {
        paths: 28,
        milestones: 145,
        completions: "5.7K",
      },
    },
    {
      id: "nexlive",
      name: "NexLive",
      description: "Live classes and interactive webinars with experts",
      icon: Video,
      color: "from-[#E74C3C] to-[#EC6B5E]",
      bgColor: "bg-[#E74C3C]",
      lightColor: "#E74C3C",
      category: "learning",
      stats: {
        sessions: 35,
        instructors: 48,
        attendees: "15K",
      },
    },
    {
      id: "nexpractice",
      name: "NexPractice",
      description: "Hands-on practice exercises and coding challenges",
      icon: Code,
      color: "from-[#4285F4] to-[#5B9AF5]",
      bgColor: "bg-[#4285F4]",
      lightColor: "#4285F4",
      category: "practice",
      isPro: true,
      stats: {
        challenges: 450,
        submissions: "125K",
        difficulty: "All levels",
      },
    },
    {
      id: "nexspeak",
      name: "NexSpeak",
      description: "Language learning and communication skills development",
      icon: MessageCircle,
      color: "from-[#9C5DE4] to-[#AB7AE8]",
      bgColor: "bg-[#9C5DE4]",
      lightColor: "#9C5DE4",
      category: "learning",
      stats: {
        languages: 12,
        lessons: 240,
        learners: "9.3K",
      },
    },
    {
      id: "nexproject",
      name: "NexProject",
      description: "Innovation labs and creative thinking workshops",
      icon: Lightbulb,
      color: "from-[#4CAF50] to-[#66BB6A]",
      bgColor: "bg-[#4CAF50]",
      lightColor: "#4CAF50",
      category: "practice",
      stats: {
        projects: 85,
        teams: 320,
        innovations: 175,
      },
    },
  ]

  // Categories for the app sections
  const categories = [
    { id: "all", name: "All Apps", filter: (app: any) => true },
    {
      id: "trending",
      name: "Trending Now",
      filter: (app: any) => ["nexpractice", "nexplay", "nexlive"].includes(app.id),
    },
    { id: "learning", name: "Learning Experiences", filter: (app: any) => app.category === "learning" },
    { id: "practice", name: "Practice & Apply", filter: (app: any) => app.category === "practice" },
    { id: "community", name: "Community & Collaboration", filter: (app: any) => app.category === "community" },
  ]

  // Calculate position of the NexPractice icon in the sidebar
  const calculateSidebarIconPosition = () => {
    // Find the NexPractice icon in the sidebar
    const sidebarIcon = document.querySelector('[data-nexapp="nexpractice"]') as HTMLElement

    if (sidebarIcon) {
      const rect = sidebarIcon.getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    }

    // Fallback position (top-left area where sidebar usually is)
    return {
      x: 50,
      y: window.innerHeight / 2,
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
        window.dispatchEvent(new Event("nexacademy:routeChangeStart"))

        // Update global state for potential NexPracticeLoader instances
        startNexPracticeLoading()

        // Start the navigation
        const navigationPromise = router.push("/nexpractice")

        // After a short delay, calculate the exit position and start exit animation
        setTimeout(() => {
          // Calculate exit position (NexPractice icon in sidebar)
          const position = calculateSidebarIconPosition()
          setExitPosition(position)

          // Start exit animation
          setIsAnimatingExit(true)

          // Update global exit state
          startNexPracticeExitAnimation(position)
          
          // After another delay (enough time for navigation to complete),
          // dispatch the routeChangeComplete event to stop the loader
          setTimeout(() => {
            window.dispatchEvent(new Event("nexacademy:routeChangeComplete"))
            stopNexPracticeLoading()
          }, 1000) // Wait 1 second after animation starts
        }, 500) // Small delay before starting exit animation
      }, 2000) // Duration of loading animation
    } else {
      // For other apps, just simulate loading
      setTimeout(() => {
        // router.push(`/app/${appId}`)
        setIsLoading(false)
        setSelectedApp(null)
      }, 3000)
    }
  }

  // Add this useEffect to handle router events
  useEffect(() => {
    const pathname = window.location.pathname
    
    // Handle popstate event (browser back/forward buttons)
    const handlePopState = () => {
      if (window.location.pathname === '/nexpractice') {
        // Dispatch custom event that the loader is listening for
        window.dispatchEvent(new Event("nexacademy:routeChangeComplete"))
        stopNexPracticeLoading()
      }
    }
    
    // Add listener for popstate events
    window.addEventListener('popstate', handlePopState)
    
    // Check if we're already on the nexpractice page
    if (pathname === '/nexpractice') {
      stopNexPracticeLoading()
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full">
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="pt-2 px-4 md:px-8 w-full">
          <div className="w-full">
            {/* Hero Slider */}
            <HeroSlider apps={apps} onSelect={handleSelect} />
          </div>
        </section>

        {/* App Categories */}
        <div className="py-4 px-4 md:px-8 w-full">
          <div className="w-full">
            {/* Tab Navigation - Centered */}
            <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-center overflow-x-auto hide-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`pb-3 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCategory === category.id
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* App Icons Grid - Only show for active category */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto"
            >
              {apps.filter(categories.find((c) => c.id === activeCategory)?.filter || (() => true)).map((app) => (
                <AppIcon
                  key={app.id}
                  app={app}
                  isHovered={hoveredApp === app.id}
                  isSelected={selectedApp === app.id}
                  otherSelected={selectedApp !== null && selectedApp !== app.id}
                  onHover={() => setHoveredApp(app.id)}
                  onLeave={() => setHoveredApp(null)}
                  onSelect={() => handleSelect(app.id)}
                />
              ))}
            </motion.div>
          </div>
        </div>
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
              scale: isAnimatingExit ? 0.4 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isAnimatingExit ? 0.8 : 0.5,
              ease: "anticipate",
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
              transformOrigin: isAnimatingExit ? "center center" : "center center",
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
    category: string
    stats: {
      [key: string]: string | number
    }
  }
  isHovered: boolean
  isSelected: boolean
  otherSelected: boolean
  onHover: () => void
  onLeave: () => void
  onSelect: () => void
}

function AppIcon({ app, isHovered, isSelected, otherSelected, onHover, onLeave, onSelect }: AppProps) {
  // Get the Icon component from the app
  const Icon = app.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: otherSelected || isSelected ? 0 : 1,
        y: 0,
      }}
      whileHover={{ y: -10 }}
      className="flex flex-col items-center"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      data-nexapp={app.id}
    >
      {/* App Icon */}
      <motion.div className="relative mb-4" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <div
          className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg cursor-pointer`}
        >
          <Icon className="h-10 w-10 text-white" />

          {/* Animated glow on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 20px 5px ${app.lightColor}40`,
                  zIndex: -1,
                }}
              />
            )}
          </AnimatePresence>

          {/* Animated rings */}
          <motion.div
            className="absolute -inset-4 rounded-full opacity-0"
            animate={isHovered ? { opacity: 0.2, scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: isHovered ? Number.POSITIVE_INFINITY : 0, duration: 2 }}
          >
            <div className={`w-full h-full rounded-full ${app.bgColor} opacity-30`}></div>
          </motion.div>

          {/* PRO badge */}
          {app.isPro && (
            <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-[10px] font-bold text-white shadow-lg">
              PRO
            </div>
          )}
        </div>
      </motion.div>

      {/* App Name */}
      <h3 className="text-lg font-medium text-slate-900 dark:text-white text-center">{app.name}</h3>

      {/* App Description - only show on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-slate-700 dark:text-slate-300 text-center mt-2 max-w-[200px]"
          >
            {app.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Selected app loader in the center
function SelectedAppLoader({
  app,
  isLoading,
  isExiting = false,
}: {
  app: AppProps["app"]
  isLoading: boolean
  isExiting?: boolean
}) {
  const Icon = app.icon

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isExiting ? 0.7 : 1.5,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="relative"
      >
        <div className={`relative w-[110px] h-[110px] rounded-full bg-gradient-to-br ${app.color}`}>
          {/* Animated rings - removed */}
          
          {/* The icon itself */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-12 w-12 text-white" />
          </div>
          
          {/* Standard blue spinner loader */}
          {isLoading && (
            <div className="absolute -inset-4 flex items-center justify-center">
              <div className="relative h-[140px] w-[140px]">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800 opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 dark:border-blue-400 animate-spin"></div>
              </div>
            </div>
          )}

          {/* PRO badge */}
          {app.isPro && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full text-xs font-bold text-white shadow-lg">
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
        <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-2">{app.name}</h3>
        {isLoading && (
          <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
            Loading...
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Animated background component
function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl"
        animate={{
          x: [0, -70, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
