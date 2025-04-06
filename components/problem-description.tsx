"use client"

import type { Problem } from "@/data/problems"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2 } from "lucide-react"
import { useState } from "react"

interface ProblemDescriptionProps {
  problem: Problem
  activeTab: string
  setActiveTab: (tab: string) => void
  testResults?: {
    sampleTestCases: Problem["sampleTestCases"]
    hiddenTestCases: Problem["hiddenTestCases"]
    allPassed: boolean
  }
}

export function ProblemDescription({ problem, activeTab, setActiveTab, testResults }: ProblemDescriptionProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-500"
      case "Intermediate":
        return "bg-[#0091FF]/20 text-[#0091FF]"
      case "Challenge":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const renderDescriptionContent = () => (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-2">
          {problem.number}. {problem.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
          {problem.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-[#252525] text-gray-300 border-[#3d3d3d]">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="bg-[#252525] text-gray-300 border-[#3d3d3d]">
            Level {problem.level}
          </Badge>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Problem Statement:</h2>
        <p className="text-gray-300">{problem.description}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Input Format:</h2>
        <p className="text-gray-300">{problem.inputFormat}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Output Format:</h2>
        <p className="text-gray-300">{problem.outputFormat}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Constraints:</h2>
        <ul className="list-disc pl-5 text-gray-300 space-y-1">
          {problem.constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Sample 1:</h2>
        <div className="grid grid-cols-2 gap-4 bg-[#1a1a1a] rounded-md overflow-hidden border border-[#2d2d2d]">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Input</h3>
            <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto">
              {problem.sampleTestCases[0].input}
            </pre>
          </div>
          <div className="p-4 border-l border-[#2d2d2d]">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Output</h3>
            <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto">
              {problem.sampleTestCases[0].expectedOutput}
            </pre>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Explanation:</h2>
        <p className="text-gray-300">{problem.explanation}</p>
      </div>
    </div>
  )

  const renderTestResultContent = () => (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Sample Testcases</h2>

        {testResults && (
          <div className="mb-4">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${testResults.allPassed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
            >
              {testResults.allPassed ? "Accepted ✓" : "Wrong Answer ✗"}
            </div>
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded-md border border-[#2d2d2d] overflow-hidden">
          <div className="flex border-b border-[#2d2d2d] bg-[#252525]">
            <div className="w-20 p-3 text-sm font-medium text-gray-400">Status</div>
            <div className="w-1/4 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">Input</div>
            <div className="w-1/3 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">Expected</div>
            <div className="flex-1 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">Got</div>
          </div>

          {testResults?.sampleTestCases.map((testCase, index) => (
            <div key={index} className="flex border-b border-[#2d2d2d] last:border-b-0">
              <div className="w-20 p-3 flex items-center justify-center">
                {testCase.status === "passed" ? (
                  <span className="text-green-500">✓</span>
                ) : testCase.status === "failed" ? (
                  <span className="text-red-500">✗</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              <div className="w-1/4 p-3 text-gray-300 border-l border-[#2d2d2d] font-mono text-sm">
                {testCase.input}
              </div>
              <div className="w-1/3 p-3 text-gray-300 border-l border-[#2d2d2d] font-mono text-sm">
                {testCase.expectedOutput}
              </div>
              <div className="flex-1 p-3 text-gray-300 border-l border-[#2d2d2d] font-mono text-sm">
                {testCase.actualOutput || "-"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Background Testcases</h2>

        {testResults && (
          <div
            className={`mb-4 p-4 rounded-md ${testResults.allPassed ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}
          >
            <div className="flex items-center">
              <span className={`text-xl mr-2 ${testResults.allPassed ? "text-green-500" : "text-red-500"}`}>
                {testResults.allPassed ? "✓" : "✗"}
              </span>
              <span className={`font-medium ${testResults.allPassed ? "text-green-500" : "text-red-500"}`}>
                {testResults.allPassed ? "Success: All test cases passed! 🎉" : "Error: Some test cases failed."}
              </span>
            </div>
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded-md border border-[#2d2d2d] overflow-hidden">
          <div className="flex border-b border-[#2d2d2d] bg-[#252525]">
            <div className="w-20 p-3 text-sm font-medium text-gray-400">Status</div>
            <div className="flex-1 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">Result</div>
          </div>

          {testResults?.hiddenTestCases.map((testCase, index) => (
            <div key={index} className="flex border-b border-[#2d2d2d] last:border-b-0">
              <div className="w-20 p-3 flex items-center justify-center">
                {testCase.status === "passed" ? (
                  <span className="text-green-500">✓</span>
                ) : testCase.status === "failed" ? (
                  <span className="text-red-500">✗</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              <div className="flex-1 p-3 text-gray-300 border-l border-[#2d2d2d]">
                {testCase.status === "passed" ? "Correct" : testCase.status === "failed" ? "Wrong Answer" : "Pending"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`flex flex-col h-full bg-[#121212] border-r border-[#2d2d2d] ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#1a1a1a] p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#252525]">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-pink-500">📝</span> Description
              </span>
            </TabsTrigger>
            <TabsTrigger value="testResult" className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white">
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Test Result
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <button onClick={toggleFullscreen} className="p-1 rounded hover:bg-[#2d2d2d] text-gray-400">
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "description" ? renderDescriptionContent() : renderTestResultContent()}
      </div>
    </div>
  )
}

