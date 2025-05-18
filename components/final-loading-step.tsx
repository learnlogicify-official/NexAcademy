"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Loader from "@/components/loader"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // If you're using Sonner for toast notifications

interface FinalLoadingStepProps {
  username: string
  userBio: string
  userInterests: string[]
  programmingLanguage: string
  selectedPath: string
  selectedLevel: string
  profilePicture: string | null
  onComplete?: () => void
}

export default function FinalLoadingStep({
  username,
  userBio,
  userInterests,
  programmingLanguage,
  selectedPath,
  selectedLevel,
  profilePicture,
  onComplete,
}: FinalLoadingStepProps) {
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [zoomEffect, setZoomEffect] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadingSteps = [
    { text: "Creating your profile...", delay: 1000 },
    { text: `Setting up ${username}'s learning environment...`, delay: 1500 },
    { text: `Configuring ${selectedPath} curriculum for ${selectedLevel} level...`, delay: 1500 },
    { text: `Optimizing for ${programmingLanguage} development...`, delay: 1000 },
    { text: "Saving your preferences to database...", delay: 1500 },
    { text: "Almost there...", delay: 1000 },
    { text: "Ready to launch!", delay: 1000 },
  ]

  // Function to save data to database
  const saveOnboardingData = async () => {
    try {
      // Save all onboarding data including interests
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          userBio,
          userInterests,
          programmingLanguage,
          learningPath: selectedPath,
          skillLevel: selectedLevel,
          profilePicture,
        }),
      });

      const data = await response.json();
      
      // Add detailed console log for debugging
      console.log("API Response:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || `Failed to complete onboarding (${response.status})`);
      }

      // Success! Continue with loading animation
      return true;
    } catch (error: any) {
      console.error("Error details:", error);
      setError(error.message || "Something went wrong. Please try again.");
      // Show error using toast if you have a toast library
      if (typeof toast !== 'undefined') {
        toast.error(error.message || "Failed to save your profile. Please try again.");
      }
      return false;
    }
  };

  useEffect(() => {
    // Simulate loading process with sequential steps
    if (loadingStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingStep(loadingStep + 1);
        
        // When we reach the "Saving to database" step
        if (loadingStep === 4) {
          saveOnboardingData().then(success => {
            if (!success) {
              // Stop the loading process on error
              setLoadingStep(loadingStep);
            }
          });
        }
      }, loadingSteps[loadingStep].delay);

      return () => clearTimeout(timer);
    } else {
      setLoadingComplete(true);

      // Wait a moment before starting zoom effect
      const timer = setTimeout(() => {
        setZoomEffect(true);

        // Wait for zoom animation to complete before calling onComplete or redirecting
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
          
          // If onComplete doesn't handle redirection, we can do it here
          // Disabled for now since we're using onComplete for animation
          // router.push("/dashboard");
        }, 1000); // Match this with the zoom animation duration
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadingStep, loadingSteps.length, onComplete, router]);

  return (
    <motion.div
      className="w-full flex flex-col items-center justify-center space-y-8"
      animate={
        zoomEffect
          ? {
              opacity: 0,
              transition: { duration: 1, ease: "easeInOut" },
            }
          : {}
      }
    >
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        <span className="white-blue-gradient">Preparing your journey</span>
      </h2>

      {/* Loader animation */}
      <div className="relative scale-75">
        <Loader />

        {/* Pulsing glow effect behind loader */}
        <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
      </div>

      {/* Loading step text with animation */}
      <div className="h-8 flex items-center justify-center">
        {loadingSteps.map((step, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: loadingStep === index ? 1 : 0,
              y: loadingStep === index ? 0 : 20,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`text-white/80 text-center absolute ${loadingStep !== index ? "pointer-events-none" : ""}`}
          >
            {step.text}
          </motion.p>
        ))}

        {loadingComplete && !zoomEffect && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-green-400 text-center font-medium"
          >
            Your Nexacademy profile is ready!
          </motion.p>
        )}
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-rose-400 text-center font-medium max-w-md"
          >
            {error}
            <button 
              onClick={() => {
                setError(null);
                setLoadingStep(4); // Retry from the database saving step
              }}
              className="ml-2 underline hover:text-rose-300"
            >
              Retry
            </button>
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}