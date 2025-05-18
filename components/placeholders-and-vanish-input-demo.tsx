"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, X, User, Loader2, AlertCircle } from "lucide-react"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { motion, AnimatePresence } from "framer-motion"

interface PlaceholdersAndVanishInputDemoProps {
  onAvailabilityChange?: (isAvailable: boolean) => void
  onUsernameChange?: (username: string) => void
}

export default function PlaceholdersAndVanishInputDemo({
  onAvailabilityChange,
  onUsernameChange,
}: PlaceholdersAndVanishInputDemoProps) {
  const placeholders = [
    "Enter your coding identity...",
    "Choose your developer alias...",
    "What name will you be known by?",
    "Select your programming persona...",
    "Create your digital signature...",
  ]

  const [username, setUsername] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Reference to form to programmatically trigger submission
  const formRef = useRef<HTMLFormElement>(null)

  // Validation function
  const validateUsername = (name: string): string[] => {
    const errors: string[] = []
    
    if (name.length < 3) {
      errors.push("Must be at least 3 characters")
    }
    
    if (name.includes(" ")) {
      errors.push("Cannot contain spaces")
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push("Only letters, numbers, hyphens and underscores")
    }
    
    if (name.toLowerCase().includes("admin")) {
      errors.push("Cannot contain 'admin'")
    }
    
    if (name.toLowerCase().includes("test")) {
      errors.push("Cannot contain 'test'")
    }
    
    return errors
  }

  // Real API call to check username availability
  const checkUsernameAvailability = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/username/check?username=${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Username check API error:", error);
        throw new Error(error.error || "Failed to check username");
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking username availability:", error);
      throw error;
    }
  };

  // Effect for validation and availability check
  useEffect(() => {
    if (username.length === 0) {
      setIsAvailable(null)
      setValidationErrors([])
      if (onAvailabilityChange) onAvailabilityChange(false)
      return
    }

    // First run validation checks
    const errors = validateUsername(username)
    setValidationErrors(errors)
    
    // If there are validation errors, don't check availability
    if (errors.length > 0) {
      setIsAvailable(false)
      if (onAvailabilityChange) onAvailabilityChange(false)
      return
    }

    // Set checking state
    setIsChecking(true)
    if (onAvailabilityChange) onAvailabilityChange(false)

    // Debounce the API call
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(username)
        setIsAvailable(available)
        setIsChecking(false)

        // Notify parent component about availability change
        if (onAvailabilityChange) onAvailabilityChange(available)
      } catch (error) {
        console.error("Error checking username availability:", error)
        setIsChecking(false)
        setIsAvailable(false)
        if (onAvailabilityChange) onAvailabilityChange(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [username, onAvailabilityChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    if (onUsernameChange) onUsernameChange(newUsername)
  }

  const handleClear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Reset all states
    setUsername("")
    setIsAvailable(null)
    setIsChecking(false)
    setValidationErrors([])
    
    // Notify parent component that username is empty/invalid
    if (onUsernameChange) onUsernameChange("")
    if (onAvailabilityChange) onAvailabilityChange(false)
    
    console.log("Username cleared")
  }

  // Determine the visual feedback for the username field
  const getAvailabilityFeedback = () => {
    if (isChecking) {
      return (
        <span className="text-blue-300 flex items-center">
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          Verifying availability...
        </span>
      )
    }
    
    if (validationErrors.length > 0) {
      return (
        <div className="flex items-center text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          <span>Invalid username</span>
        </div>
      )
    }
    
    if (isAvailable === null) {
      return <span className="text-zinc-400">Enter a unique username</span>
    }
    
    if (isAvailable) {
      return (
        <div className="flex items-center text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
          <Check className="w-3.5 h-3.5 mr-1.5" />
          <span>Username available</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">
        <X className="w-3.5 h-3.5 mr-1.5" />
        <span>Username taken</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      <motion.div 
        className="w-full max-w-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <PlaceholdersAndVanishInput 
          placeholders={placeholders} 
          onChange={handleChange} 
          onSubmit={handleClear} 
        />
      </motion.div>

      {/* Username availability indicator with enhanced styling */}
      <AnimatePresence>
        {username.length > 0 && (
          <motion.div 
            className="h-6 flex items-center justify-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div className="text-sm">
              {getAvailabilityFeedback()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modern Username Requirements - always visible once typing starts */}
      <AnimatePresence>
        {username.length > 0 && (
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-xl p-4 overflow-hidden">
              <h3 className="text-xs font-medium text-zinc-300 mb-3">Username Requirements</h3>
              
              <div className="space-y-2">
                {/* Length Requirement */}
                <RequirementItem 
                  satisfied={!validationErrors.includes("Must be at least 3 characters")}
                  text="3+ characters" 
                  index={0}
                />
                
                {/* No Spaces */}
                <RequirementItem 
                  satisfied={!validationErrors.includes("Cannot contain spaces")}
                  text="No spaces" 
                  index={1}
                />
                
                {/* Valid Characters */}
                <RequirementItem 
                  satisfied={!validationErrors.includes("Only letters, numbers, hyphens and underscores")}
                  text="Only letters, numbers, hyphens and underscores" 
                  index={2}
                />
                
                {/* No "admin" */}
                <RequirementItem 
                  satisfied={!validationErrors.includes("Cannot contain 'admin'")}
                  text="Cannot contain 'admin'" 
                  index={3}
                />
                
                {/* No "test" */}
                <RequirementItem 
                  satisfied={!validationErrors.includes("Cannot contain 'test'")}
                  text="Cannot contain 'test'" 
                  index={4}
                />
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3 bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${Math.max(0, Math.min(100, (5 - validationErrors.length) / 5 * 100))}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Requirement Item Component
function RequirementItem({ satisfied, text, index }: { satisfied: boolean; text: string; index: number }) {
  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <motion.div 
        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full mr-2.5 ${
          satisfied ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-600'
        }`}
        animate={{ 
          backgroundColor: satisfied ? 'rgba(59, 130, 246, 0.2)' : 'rgba(39, 39, 42, 1)',
          color: satisfied ? 'rgb(96, 165, 250)' : 'rgb(82, 82, 91)' 
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {satisfied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Check className="w-3 h-3" />
            </motion.div>
          ) : (
            <motion.div
              key="circle"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <span className={`text-xs ${satisfied ? 'text-zinc-300' : 'text-zinc-500'}`}>
        {text}
      </span>
    </motion.div>
  );
}