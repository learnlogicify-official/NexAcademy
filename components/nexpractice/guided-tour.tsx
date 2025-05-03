"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Lightbulb, ChevronRight, ChevronLeft, X } from "lucide-react"

interface TourStep {
  title: string
  description: string
  targetElement: string // CSS selector for the element to highlight
  placement: "top" | "bottom" | "left" | "right"
}

export function GuidedTour() {
  const [showTour, setShowTour] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isTourCompleted, setIsTourCompleted] = useState(false)
  
  // Check if this is the first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("nexacademy_problem_tour_completed")
    if (!hasSeenTour) {
      // Wait a moment before showing the tour
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      setIsTourCompleted(true)
    }
  }, [])
  
  const tourSteps: TourStep[] = [
    {
      title: "Welcome to NexPractice!",
      description: "Let us guide you through the problem-solving interface to help you get started.",
      targetElement: "body", // No specific target for the intro
      placement: "bottom",
    },
    {
      title: "Problem Description",
      description: "This panel contains the problem statement, examples, and constraints to help you understand what to solve.",
      targetElement: ".problem-description",
      placement: "right",
    },
    {
      title: "Code Editor",
      description: "Write your solution here. You can change the programming language using the dropdown above the editor.",
      targetElement: ".code-editor-container",
      placement: "left",
    },
    {
      title: "Run Your Code",
      description: "Test your solution against the example test cases by clicking the Run button.",
      targetElement: "button:contains('Run')",
      placement: "bottom",
    },
    {
      title: "Submit Solution",
      description: "Once you're confident in your solution, submit it to validate against all test cases.",
      targetElement: "button:contains('Submit')",
      placement: "bottom",
    },
    {
      title: "Save & Share",
      description: "You can save your code as a snippet or export it to share with others.",
      targetElement: "button:has(.more-horizontal)",
      placement: "bottom",
    },
    {
      title: "You're All Set!",
      description: "Now you're ready to start solving problems. Happy coding!",
      targetElement: "body",
      placement: "bottom",
    },
  ]
  
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const completeTour = () => {
    localStorage.setItem("nexacademy_problem_tour_completed", "true")
    setShowTour(false)
    setIsTourCompleted(true)
  }
  
  const restartTour = () => {
    setCurrentStep(0)
    setShowTour(true)
  }
  
  if (isTourCompleted) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 z-50 bg-white shadow-md flex items-center gap-1"
        onClick={restartTour}
      >
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        <span>Show Tour</span>
      </Button>
    )
  }
  
  return (
    <>
      {showTour && (
        <Dialog open={showTour} onOpenChange={setShowTour}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                {tourSteps[currentStep].title}
              </DialogTitle>
              <DialogDescription>
                {tourSteps[currentStep].description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between items-center">
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={completeTour}>
                  <X className="h-4 w-4 mr-1" />
                  Skip Tour
                </Button>
                <Button 
                  size="sm" 
                  onClick={nextStep}
                  className="flex items-center gap-1"
                >
                  {currentStep < tourSteps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : "Finish Tour"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 