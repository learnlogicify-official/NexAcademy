"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface PracticeSectionProps {
  module: {
    title: string
  }
  onNavigateToProblem: (difficulty: string, problemNumber: number) => void
}

export function PracticeSection({ module, onNavigateToProblem }: PracticeSectionProps) {
  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="overflow-hidden border-0 shadow-md bg-[#121212] h-full">
        <CardContent className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-bold mb-3">Practice Problems</h2>
          <p className="text-gray-400 text-sm mb-4">
            Test your understanding of {module.title.toLowerCase()} with these practice problems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Easy", "Medium", "Hard"].map((difficulty) => (
              <Card key={difficulty} className="overflow-hidden border-0 shadow-md bg-[#121212]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      className={
                        difficulty === "Easy"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : difficulty === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {difficulty}
                    </Badge>
                    <span className="text-xs text-gray-400">5 Problems</span>
                  </div>

                  <h3 className="text-sm font-semibold mb-2">
                    {difficulty === "Easy"
                      ? "Basic Concepts"
                      : difficulty === "Medium"
                        ? "Applied Knowledge"
                        : "Advanced Problems"}
                  </h3>

                  <p className="text-gray-400 text-xs mb-3">
                    {difficulty === "Easy"
                      ? "Fundamental exercises to build your foundation"
                      : difficulty === "Medium"
                        ? "Intermediate challenges to strengthen skills"
                        : "Complex problems to master the concepts"}
                  </p>

                  <div className="space-y-1">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-gray-800 cursor-pointer text-xs"
                          onClick={() => onNavigateToProblem(difficulty, i + 1)}
                        >
                          <span>Problem {i + 1}</span>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        </div>
                      ))}
                    <div className="p-1 text-center text-gray-400 text-xs">+2 more problems</div>
                  </div>

                  <Button
                    className="w-full mt-3 text-xs py-1 h-8"
                    variant={difficulty === "Easy" ? "default" : "outline"}
                    onClick={() => onNavigateToProblem(difficulty, 1)}
                  >
                    Start Practicing
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
