"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, Clock } from "lucide-react"

interface AssessmentsListProps {
  modules: any[]
}

export function AssessmentsList({ modules }: AssessmentsListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Assessments</h2>
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden border-0 shadow-md bg-[#121212]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{module.title} Assessment</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Test your knowledge of {module.title.toLowerCase()} with this comprehensive quiz
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <ClipboardCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">10 Questions</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">15 Minutes</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
