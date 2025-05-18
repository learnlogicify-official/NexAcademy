"use client"
import { useRef, useEffect, useState } from "react"
import { motion, useMotionTemplate, AnimatePresence } from "framer-motion"
import Loader from "@/components/loader"
import gsap from "gsap"
import { TextPlugin } from "gsap/TextPlugin"
import HoverBorderGradientDemo from "@/components/hover-border-gradient-demo"
import PlaceholdersAndVanishInputDemo from "@/components/placeholders-and-vanish-input-demo"
import UserBioInput from "@/components/user-bio-input"
import ProgrammingLanguageSelection from "@/components/programming-language-selection"
import LearningPathSelection from "@/components/learning-path-selection"
import SkillLevelSelection from "@/components/skill-level-selection"
import FinalLoadingStep from "@/components/final-loading-step"
import ProfileImageUpload from "@/components/profile-image-upload"
import { toast } from "sonner"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin)
}

// Enhanced premium colors
const GRADIENT_START = "#3B82F6" // Blue-500
const GRADIENT_MID = "#2563EB"   // Blue-600
const GRADIENT_END = "#1D4ED8"   // Blue-700

// Form steps
type FormStep =
  | "username"
  | "profile-picture"
  | "user-bio"
  | "programming-language"
  | "learning-path"
  | "skill-level"
  | "final-loading"
  | "dashboard"

export default function OnboardingClientPage() {
  const typewriterRef = useRef<HTMLDivElement>(null)
  const typewriterContainerRef = useRef<HTMLDivElement>(null)
  const secondTypewriterRef = useRef<HTMLDivElement>(null)
  const secondTypewriterContainerRef = useRef<HTMLDivElement>(null)

  // Animation states
  const [showLoader, setShowLoader] = useState(true)
  const [showTypewriter, setShowTypewriter] = useState(false)
  const [showSecondTypewriter, setShowSecondTypewriter] = useState(false)
  const [showFinalText, setShowFinalText] = useState(false)
  const [showButton, setShowButton] = useState(false)

  // Form states
  const [currentStep, setCurrentStep] = useState<FormStep>("username")
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false)
  const [username, setUsername] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [userBio, setUserBio] = useState("")
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [programmingLanguage, setProgrammingLanguage] = useState<string>("")
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")

  // Create enhanced motion templates with premium gradients
  const backgroundImage = useMotionTemplate`radial-gradient(140% 140% at 50% 0%, #000 55%, ${GRADIENT_START}60 80%, ${GRADIENT_MID}40 100%)`
  const bottomGradient = useMotionTemplate`linear-gradient(to top, ${GRADIENT_START}50 0%, rgba(0,0,0,0) 100%)`

  // Handle form submission
  const handleSubmitUsername = () => {
    setCurrentStep("profile-picture")
  }

  const handleProfilePictureSubmit = async (imageUrl: string | null) => {
    try {
      if (imageUrl) {
        // Show a loading state while we upload to Cloudinary
        toast.loading('Uploading profile picture...')
        
        // Import the Cloudinary upload utility
        const { uploadToCloudinary } = await import('@/utils/uploadToCloudinary')
        
        // Upload the image to Cloudinary and get the secure URL
        const cloudinaryUrl = await uploadToCloudinary(imageUrl)
        
        // Set the Cloudinary URL instead of the base64 data
        setProfilePicture(cloudinaryUrl)
        toast.success('Profile picture uploaded successfully!')
      } else {
        // No image selected, continue with null
        setProfilePicture(null)
      }
      
      // Move to the next step
      setCurrentStep("user-bio")
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture. Please try again.')
      // Still allow them to continue without a profile picture
      setCurrentStep("user-bio")
    }
  }

  const handleSubmitBio = (bio: string, interests: string[]) => {
    setUserBio(bio)
    setUserInterests(interests)
    setCurrentStep("programming-language")
  }

  const handleSelectProgrammingLanguage = (language: string) => {
    setProgrammingLanguage(language)
    setCurrentStep("learning-path")
  }

  const handleSelectPath = (path: string) => {
    setSelectedPath(path)
    setCurrentStep("skill-level")
  }

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level)
    setCurrentStep("final-loading")
  }

  // Enhanced fade-to-black transition
  const [fadeToBlack, setFadeToBlack] = useState(false)

  // Modify the handleFinalLoadingComplete function
  const handleFinalLoadingComplete = () => {
    // First fade to black
    setFadeToBlack(true)

    // Then transition to dashboard after the fade completes
    setTimeout(() => {
      // Directly redirect to the main dashboard
      window.location.href = "/dashboard"
    }, 1500) // Longer fade for more dramatic effect
  }

  // Handle first typewriter effect
  useEffect(() => {
    // Show loader for 1 second, then show typewriter
    const timer = setTimeout(() => {
      setShowLoader(false)
      setShowTypewriter(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showTypewriter && typewriterRef.current && typewriterContainerRef.current) {
      const typewriterTl = gsap.timeline()
      // Enhanced first typewriter text
      const text = "Prepare to enter the future of coding..."

      // Enhanced typewriter entrance animation with 3D effect
      typewriterTl.fromTo(
        typewriterContainerRef.current,
        { opacity: 0, y: 15, rotateX: -10 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power2.out" }
      )

      // Type in the text with enhanced timing
      typewriterTl.to(typewriterRef.current, {
        duration: 2,
        text: text,
        ease: "none",
        delay: 0.3,
      })

      // Add a subtle floating animation
      typewriterTl.to(typewriterRef.current, {
        y: -5,
        duration: 1.5,
        ease: "power1.inOut",
        repeat: 1,
        yoyo: true,
      })

      // Wait a moment
      typewriterTl.to(
        {},
        {
          duration: 1,
        },
      )

      // Enhanced fade out with 3D effect
      typewriterTl.to(typewriterContainerRef.current, {
        opacity: 0,
        y: -15,
        rotateX: 10,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          setShowTypewriter(false)
          setShowSecondTypewriter(true)
        },
      })

      return () => {
        typewriterTl.kill() // Clean up timeline on unmount
      }
    }
  }, [showTypewriter])

  // Handle second typewriter effect after first one fades
  useEffect(() => {
    if (showSecondTypewriter && secondTypewriterRef.current && secondTypewriterContainerRef.current) {
      const secondTypewriterTl = gsap.timeline()
      // Enhanced second typewriter text
      const text = "Your digital transformation begins now…"

      // Enhanced entrance with 3D effect
      secondTypewriterTl.fromTo(
        secondTypewriterContainerRef.current,
        { opacity: 0, y: 15, rotateX: -10 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power2.out" }
      )

      // Type in the text with enhanced timing
      secondTypewriterTl.to(secondTypewriterRef.current, {
        duration: 2,
        text: text,
        ease: "none",
        delay: 0.3,
      })

      // Add premium glow effect to the text
      secondTypewriterTl.to(secondTypewriterRef.current, {
        textShadow: `0 0 10px rgba(99, 102, 241, 0.7), 0 0 20px rgba(139, 92, 246, 0.5)`,
        duration: 1,
        ease: "power2.inOut",
      })

      // Wait a moment with subtle floating
      secondTypewriterTl.to(secondTypewriterContainerRef.current, {
        y: "-=5",
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1,
      })

      // Enhanced fade out with 3D effect
      secondTypewriterTl.to(secondTypewriterContainerRef.current, {
        opacity: 0,
        y: -15,
        rotateX: 10,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          console.log("Second typewriter animation complete, showing final text")
          setShowSecondTypewriter(false)
          setShowFinalText(true)
          // Show button immediately with final text
          setShowButton(true)
        },
      })

      return () => {
        secondTypewriterTl.kill() // Clean up timeline on unmount
      }
    }
  }, [showSecondTypewriter])

  return (
    <div className="flex min-h-screen h-auto flex-col bg-black w-full relative overflow-x-hidden perspective-1000">
      {/* Premium 3D floating objects in background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Floating code brackets */}
        <div className="absolute w-32 h-32 left-[10%] top-[20%] text-7xl opacity-10 text-blue-500 font-mono animate-float-slow">
          {"{"}
        </div>
        <div className="absolute w-32 h-32 right-[15%] top-[70%] text-7xl opacity-10 text-blue-500 font-mono animate-float-slow-reverse">
          {"}"}
        </div>
        <div className="absolute w-32 h-32 left-[20%] bottom-[15%] text-7xl opacity-10 text-blue-600 font-mono animate-float-slow-delay">
          {"<"}
        </div>
        <div className="absolute w-32 h-32 right-[20%] top-[15%] text-7xl opacity-10 text-blue-600 font-mono animate-float-slower">
          {">"}
        </div>
        
        {/* Premium floating 3D shapes */}
        <div className="absolute w-40 h-40 left-[25%] top-[40%] opacity-20 rounded-full border border-blue-500/30 animate-float-slow perspective-element">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm"></div>
        </div>
        <div className="absolute w-32 h-32 right-[30%] bottom-[30%] opacity-20 rounded-lg border border-blue-600/30 animate-float-slower perspective-element rotate-12">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600/10 to-blue-700/10 backdrop-blur-sm"></div>
        </div>
        
        {/* Premium particle dots */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
              background: `rgba(${Math.random() > 0.5 ? '99, 102, 241' : '139, 92, 246'}, ${Math.random() * 0.7 + 0.3})`,
              animation: `float-random ${Math.random() * 10 + 15}s infinite ease-in-out alternate`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced grid overlay */}
      <div className="hero-grid absolute inset-0 z-5 opacity-15" 
           style={{ 
             backgroundSize: '40px 40px',
             backgroundImage: `
               linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
             `
           }} />

      {/* Premium vignette overlay */}
      <div className="absolute inset-0 z-5 pointer-events-none" 
           style={{ 
             background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.8) 100%)`,
             mixBlendMode: 'multiply'
           }}></div>

      {/* Enhanced black overlay for transition */}
      {fadeToBlack && (
        <motion.div
          className="fixed inset-0 bg-black z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Loader />
        </motion.div>
      )}

      {/* Main content with enhanced transitions */}
      <motion.div className="flex-1 relative z-10 w-full bg-black" animate={{ opacity: fadeToBlack ? 0 : 1 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}>
        {showLoader ? (
          <div className="flex items-center justify-center min-h-screen w-full bg-black">
            <Loader />
          </div>
        ) : (
          <motion.section
            style={{ backgroundImage }}
            className="relative flex min-h-screen h-auto items-center justify-center overflow-y-auto overflow-x-hidden py-10 bg-black"
          >
            {/* Enhanced Bottom Gradient */}
            <motion.div
              style={{ background: bottomGradient }}
              className="absolute bottom-0 left-0 right-0 z-20 h-64 opacity-70 pointer-events-none"
            />

            {/* Hero Content - Centered Container */}
            <div className="relative z-30 flex items-center justify-center w-full py-10">
              {/* Animation Container - All animations are absolutely positioned within this container */}
              <div className="relative flex flex-col items-center justify-center w-full">
                {/* Enhanced First Typewriter */}
                {showTypewriter && (
                  <div ref={typewriterContainerRef} className="absolute perspective-text">
                    <div
                      ref={typewriterRef}
                      className="font-mono font-light text-base md:text-xl lg:text-2xl premium-text-gradient"
                      style={{ 
                        letterSpacing: "0.5px",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      }}
                    ></div>
                  </div>
                )}

                {/* Enhanced Second Typewriter */}
                {showSecondTypewriter && (
                  <div ref={secondTypewriterContainerRef} className="absolute perspective-text">
                    <div
                      ref={secondTypewriterRef}
                      className="font-mono font-light text-base md:text-xl lg:text-2xl premium-text-gradient"
                      style={{ 
                        letterSpacing: "0.5px",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      }}
                    ></div>
                  </div>
                )}

                {/* Final Content Container with enhanced 3D effects */}
                <AnimatePresence>
                  {showFinalText && (
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col items-center space-y-10 w-full px-4">
                        {/* Enhanced "Welcome to Nexacademy" title with premium animations */}
                        {currentStep === "username" && (
                          <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 1, 
                              ease: [0.22, 1, 0.36, 1],
                              delay: 0.2
                            }}
                            className="perspective-text"
                          >
                            <h1 className="premium-text-gradient text-3xl md:text-5xl lg:text-6xl font-bricolage tracking-tight"
                                style={{ 
                                  textShadow: "0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)",
                                }}>
                              Welcome to Nexacademy
                            </h1>
                          </motion.div>
                        )}

                        {/* Form Steps Container - Enhanced with premium glass morphism effect */}
                        <div className="w-full max-w-5xl relative overflow-visible "
                             >
                          {/* Username Step */}
                          <AnimatePresence mode="wait">
                            {currentStep === "username" && (
                              <motion.div
                                key="username-step"
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                
                              
                                {/* Input field */}
                                {showButton && (
                                  <div className="w-full flex flex-col items-center">
                                    <PlaceholdersAndVanishInputDemo
                                      onAvailabilityChange={setIsUsernameAvailable}
                                      onUsernameChange={setUsername}
                                    />
                                  </div>
                                )}

                                {/* Button component */}
                                {showButton && (
                                  <div>
                                    <HoverBorderGradientDemo
                                      isEnabled={isUsernameAvailable}
                                      onSubmit={handleSubmitUsername}
                                    />
                                  </div>
                                )}
                              </motion.div>
                            )}

                            {/* Profile Picture Step */}
                            {currentStep === "profile-picture" && (
                              <motion.div
                                key="profile-picture-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <ProfileImageUpload 
                                  username={username} 
                                  onContinue={handleProfilePictureSubmit} 
                                />
                              </motion.div>
                            )}

                            {/* User Bio Step */}
                            {currentStep === "user-bio" && (
                              <motion.div
                                key="user-bio-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <UserBioInput username={username} onContinue={handleSubmitBio} />
                              </motion.div>
                            )}

                            {/* Programming Language Selection Step */}
                            {currentStep === "programming-language" && (
                              <motion.div
                                key="programming-language-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <ProgrammingLanguageSelection
                                  username={username}
                                  onSelectLanguage={handleSelectProgrammingLanguage}
                                />
                              </motion.div>
                            )}

                            {/* Learning Path Selection Step */}
                            {currentStep === "learning-path" && (
                              <motion.div
                                key="learning-path-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <LearningPathSelection username={username} onSelectPath={handleSelectPath} />
                              </motion.div>
                            )}

                            {/* Skill Level Selection Step */}
                            {currentStep === "skill-level" && (
                              <motion.div
                                key="skill-level-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <SkillLevelSelection
                                  username={username}
                                  selectedPath={selectedPath}
                                  onSelectLevel={handleSelectLevel}
                                />
                              </motion.div>
                            )}

                            {/* Final Loading Step */}
                            {currentStep === "final-loading" && (
                              <motion.div
                                key="final-loading-step"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center space-y-2 w-full"
                              >
                                <FinalLoadingStep
                                  username={username}
                                  userBio={userBio}
                                  userInterests={userInterests}
                                  programmingLanguage={programmingLanguage}
                                  selectedPath={selectedPath}
                                  selectedLevel={selectedLevel}
                                  profilePicture={profilePicture}
                                  onComplete={handleFinalLoadingComplete}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </motion.div>
    </div>
  )
}