"use client"

import { useState, useCallback, useEffect } from "react"
import OnboardingHeader from "@/components/onboarding/onboarding-header"
import UsernameStep from "@/components/onboarding/username-step"
import BioStep from "@/components/onboarding/bio-step"
import LanguageStep from "@/components/onboarding/language-step"
import CodeEditorStep from "@/components/onboarding/code-editor-step"
import OnboardingComplete from "@/components/onboarding/onboarding-complete"
import AIAssistant from "@/components/onboarding/ai-assistant"
import ThemeToggle from "@/components/onboarding/theme-toggle"
import BackgroundGrid from "@/components/onboarding/background-grid"
import ProgressIndicator from "@/components/onboarding/progress-indicator"
import KeyboardShortcuts from "@/components/onboarding/keyboard-shortcuts"
import ConfettiCelebration from "@/components/onboarding/confetti-celebration"
import IDEShowcase from "@/components/onboarding/ide-showcase"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export type OnboardingData = {
  username: string
  bio: string
  language: string
  code: string
}

export default function OnboardingClientPage() {
  const [step, setStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
  const [data, setData] = useState<OnboardingData>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexacademy_onboarding")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed
        } catch (e) {
          console.error("Failed to parse saved data", e)
        }
      }
    }

    // Default values
    const defaultLanguage = "javascript"
    const defaultCode = 'console.log("Hello, NexAcademy! Ready to learn coding with AI.");'

    return {
      username: "",
      bio: "",
      language: defaultLanguage,
      code: defaultCode,
    }
  })

  // Add client-side session check for hasOnboarded
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status !== "authenticated") return;
    console.log('[Client] Session in onboarding-client-page:', session)
    if (session?.user?.hasOnboarded) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nexacademy_onboarding", JSON.stringify(data))
    }
  }, [data])

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData((prevData) => ({ ...prevData, ...newData }))
  }, [])

  const nextStep = useCallback(() => {
    if (step === 4) {
      // Show confetti when completing the code step
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    setStep((prev) => prev + 1)
  }, [step])

  const prevStep = useCallback(() => {
    setStep((prev) => prev - 1)
  }, [])

  // Step labels for the progress indicator
  const stepLabels = ["Username", "Bio", "Language", "Code"]

  // AI messages based on current step
  const getAIMessage = () => {
    switch (step) {
      case 1:
        return "Hey there! I'm Nex, your AI learning buddy. Let's start with your username - something cool that represents you in our coding community!"
      case 2:
        return `Nice to meet you, @${data.username || "friend"}! Tell me a bit about yourself so I can tailor your learning experience.`
      case 3:
        return "What programming language are you most comfortable with? I'll customize your learning path based on your preference."
      case 4:
        return `Awesome! Let's write your first ${data.language} program together. I've set up a simple \"Hello World\" for you to run.`
      case 5:
        return `Welcome to NexAcademy, @${data.username}! You did it. 🚀`;
      default:
        return "Let's get you set up with NexAcademy!"
    }
  }

  return (
    <div className="min-h-screen h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <BackgroundGrid />
      <ThemeToggle />
      <OnboardingHeader />

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col ">
        <ProgressIndicator currentStep={step} totalSteps={4} labels={stepLabels} />

        <div className="flex flex-col lg:flex-row gap-6 flex-1 ">
          <div className="w-full lg:w-1/3">
            <AIAssistant message={getAIMessage()} step={step} username={data.username} />
          </div>

          <div className="w-full lg:w-2/3 relative flex flex-col justify-start items-center py-4 px-1 sm:px-4 min-h-[500px] max-h-[calc(100vh-120px)] rounded-2xl overflow-y-auto terminal-panel text-sm">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 h-8 px-4 bg-slate-800/80 border-b border-slate-700/60 rounded-t-2xl w-full">
              <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-900/40"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400/80 border border-yellow-900/40"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 border border-green-900/40"></span>
              <span className="ml-4 text-xs text-slate-400 font-mono tracking-widest">nexacademy — onboarding</span>
            </div>
            <div className="w-full max-w-xl mx-auto z-10 flex-1 flex flex-col justify-center py-6 font-mono">
              {/* Step Content */}
              {step === 1 && (
                <UsernameStep
                  username={data.username}
                  updateUsername={(username) => updateData({ username })}
                  onNext={nextStep}
                />
              )}
              {step === 2 && (
                <BioStep bio={data.bio} updateBio={(bio) => updateData({ bio })} onNext={nextStep} onBack={prevStep} />
              )}
              {step === 3 && (
                <LanguageStep
                  language={data.language}
                  updateLanguage={(language) => updateData({ language })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {step === 4 && (
                <IDEShowcase
                  preferredLanguage={data.language}
                  username={data.username}
                  bio={data.bio}
                />
              )}
              {step === 5 && <OnboardingComplete data={data} />}
            </div>
          </div>
        </div>
      </div>

      <KeyboardShortcuts
        onNext={step < 5 ? nextStep : () => {}}
        onBack={step > 1 ? prevStep : undefined}
        disabled={step === 5}
      />

      <ConfettiCelebration trigger={showConfetti} />
    </div>
  )
} 