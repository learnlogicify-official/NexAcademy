import type { Problem } from "@/data/courses"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProblemStatementProps {
  problem: Problem
}

export function ProblemStatement({ problem }: ProblemStatementProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-500"
      case "Intermediate":
        return "bg-[#0091FF]/10 text-[#0091FF]"
      case "Challenge":
        return "bg-purple-500/10 text-purple-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl font-bold text-white">{problem.title}</h1>
          <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>XP Reward: {problem.xpReward}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p>{problem.description}</p>
      </div>

      <Tabs defaultValue="description" className="mt-6">
        <TabsList className="bg-[#252525]">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Input Format</h3>
            <div className="bg-[#252525] p-3 rounded-md text-sm">
              <pre>{problem.inputFormat}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Output Format</h3>
            <div className="bg-[#252525] p-3 rounded-md text-sm">
              <pre>{problem.outputFormat}</pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Sample Input</h3>
            <div className="bg-[#252525] p-3 rounded-md text-sm">
              <pre>{problem.sampleInput}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Sample Output</h3>
            <div className="bg-[#252525] p-3 rounded-md text-sm">
              <pre>{problem.sampleOutput}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Explanation</h3>
            <p className="text-sm text-gray-300">{problem.explanation}</p>
          </div>
        </TabsContent>

        <TabsContent value="constraints" className="mt-4">
          <div className="bg-[#252525] p-3 rounded-md text-sm">
            <pre>{problem.constraints}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

