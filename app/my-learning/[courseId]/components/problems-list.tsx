"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProblemsListProps {
  modules: any[]
}

export function ProblemsList({ modules }: ProblemsListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Practice Problems</h2>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="space-y-4">
                <h3 className="text-lg font-medium">{module.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Easy", "Medium", "Hard"].map((difficulty) => (
                    <Card key={difficulty} className="overflow-hidden border-0 shadow-md bg-[#121212]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
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
                          <span className="text-sm text-gray-400">10 Problems</span>
                        </div>
                        <h4 className="font-medium">
                          {difficulty === "Easy"
                            ? "Basic Concepts"
                            : difficulty === "Medium"
                              ? "Applied Knowledge"
                              : "Advanced Problems"}
                        </h4>
                        <p className="text-gray-400 text-sm mt-1">
                          {difficulty === "Easy"
                            ? "Fundamental exercises to build your foundation"
                            : difficulty === "Medium"
                              ? "Intermediate challenges to strengthen skills"
                              : "Complex problems to master the concepts"}
                        </p>
                        <Button className="w-full mt-4" variant="outline">
                          Start Practicing
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {["easy", "medium", "hard"].map((level) => (
          <TabsContent key={level} value={level} className="mt-6">
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="space-y-4">
                  <h3 className="text-lg font-medium">{module.title}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {Array(10)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i} className="overflow-hidden border-0 shadow-md bg-[#121212]">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">Problem {i + 1}</h4>
                                <p className="text-gray-400 text-sm mt-1">
                                  {level === "easy"
                                    ? `Simple exercise on ${module.title.toLowerCase()}`
                                    : level === "medium"
                                      ? `Intermediate challenge with ${module.title.toLowerCase()}`
                                      : `Advanced problem using ${module.title.toLowerCase()}`}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">
                                Solve
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
