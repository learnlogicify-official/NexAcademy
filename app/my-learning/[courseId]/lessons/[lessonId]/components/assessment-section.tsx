"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, Clock, Trophy } from "lucide-react"

interface AssessmentSectionProps {
  module: {
    title: string
  }
}

export function AssessmentSection({ module }: AssessmentSectionProps) {
  return (
    <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
      <Card className="overflow-hidden border-0 shadow-md bg-[#121212] max-w-md w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <ClipboardCheck className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{module.title} Assessment</h2>
              <p className="text-gray-400 text-sm">Test your knowledge with this quiz</p>
            </div>
          </div>

          <div className="space-y-4 mb-5">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">10 Questions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">15 Minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">100 XP</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              This assessment will test your understanding of {module.title.toLowerCase()}. You need to score at least
              70% to pass and earn XP.
            </p>
          </div>

          <Button className="w-full">Start Assessment</Button>
        </CardContent>
      </Card>
    </div>
  )
}
