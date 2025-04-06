"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { type Problem, sampleProblem } from "@/data/problems"
import { ArrowLeft, Clock, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProblemPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = params.id as string

  const [problem, setProblem] = useState<Problem | null>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [testResults, setTestResults] = useState<{
    sampleTestCases: Problem["sampleTestCases"]
    hiddenTestCases: Problem["hiddenTestCases"]
    allPassed: boolean
  } | null>(null)
  const [solvedProblems, setSolvedProblems] = useState<number[]>([])
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from an API
    setProblem(sampleProblem)

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [problemId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleRun = (code: string) => {
    setIsRunning(true)

    // Mock execution
    setTimeout(() => {
      if (problem) {
        const updatedSampleTestCases = problem.sampleTestCases.map((testCase) => ({
          ...testCase,
          actualOutput: testCase.expectedOutput, // In a real app, this would be the actual output from running the code
          status: "passed" as const,
        }))

        setTestResults({
          sampleTestCases: updatedSampleTestCases,
          hiddenTestCases: problem.hiddenTestCases,
          allPassed: true,
        })

        setActiveTab("testResult")
      }

      setIsRunning(false)
    }, 1500)
  }

  const handleSubmit = (code: string) => {
    setIsSubmitting(true)

    // Mock submission
    setTimeout(() => {
      if (problem) {
        const updatedSampleTestCases = problem.sampleTestCases.map((testCase) => ({
          ...testCase,
          actualOutput: testCase.expectedOutput,
          status: "passed" as const,
        }))

        const updatedHiddenTestCases = problem.hiddenTestCases.map((testCase) => ({
          ...testCase,
          status: "passed" as const,
        }))

        setTestResults({
          sampleTestCases: updatedSampleTestCases,
          hiddenTestCases: updatedHiddenTestCases,
          allPassed: true,
        })

        setSolvedProblems((prev) => [...prev, 0]) // Mark current problem as solved
        setActiveTab("testResult")
      }

      setIsSubmitting(false)
    }, 2000)
  }

  const handleBack = () => {
    router.back()
  }

  const handleNavigate = (index: number) => {
    // In a real app, this would navigate to a different problem
    console.log(`Navigate to problem ${index + 1}`)
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0091FF]"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121212] overflow-hidden">
      {/* Problem header */}
      <header className="flex items-center justify-between p-3 bg-[#1a1a1a] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#0091FF] to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
            <span className="text-white font-medium">Problem Solving in Python</span>
          </div>

          <div className="flex gap-2">
            {problem.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 text-sm bg-[#252525] text-gray-300 rounded-full">
                {tag}
              </span>
            ))}
            <span className="px-3 py-1 text-sm bg-[#252525] text-gray-300 rounded-full">Level {problem.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#252525] px-3 py-1 rounded-md text-gray-300">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Problem description */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          <div className="bg-[#1a1a1a] border-b border-[#2d2d2d] p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-[#252525]">
                <TabsTrigger
                  value="description"
                  className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="testResult"
                  className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white"
                >
                  Test Result
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "description" ? (
              <div className="p-4">
                <h2 className="text-2xl font-bold text-white mb-4">{problem.title}</h2>
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Problem Statement:</h3>
                  <p className="text-gray-300">{problem.description}</p>

                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Input Format:</h3>
                  <p className="text-gray-300">{problem.inputFormat}</p>

                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Output Format:</h3>
                  <p className="text-gray-300">{problem.outputFormat}</p>

                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Constraints:</h3>
                  <ul className="list-disc pl-5 text-gray-300">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-white mt-6 mb-2">Sample:</h3>
                  {problem.sampleTestCases.map((testCase, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-medium text-white">Sample {index + 1}:</h4>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Input:</p>
                          <pre className="bg-[#252525] p-2 rounded text-gray-300 overflow-x-auto">{testCase.input}</pre>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Output:</p>
                          <pre className="bg-[#252525] p-2 rounded text-gray-300 overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                      {testCase.explanation && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400 mb-1">Explanation:</p>
                          <p className="text-gray-300">{testCase.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                {testResults ? (
                  <>
                    <div
                      className={`mb-6 p-3 rounded-md ${testResults.allPassed ? "bg-green-900/20 border border-green-700" : "bg-red-900/20 border border-red-700"}`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${testResults.allPassed ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {testResults.allPassed ? "✓" : "✗"}
                        </div>
                        <span className={`font-medium ${testResults.allPassed ? "text-green-400" : "text-red-400"}`}>
                          {testResults.allPassed
                            ? "Success: All test cases passed! 🎉"
                            : "Error: Some test cases failed."}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">Sample Testcases</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#252525] text-left">
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Status</th>
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Input</th>
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Expected</th>
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Got</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.sampleTestCases.map((testCase, index) => (
                            <tr key={index} className="border-b border-[#2d2d2d]">
                              <td className="p-2 border border-[#2d2d2d]">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${testCase.status === "passed" ? "bg-green-600" : "bg-red-600"}`}
                                >
                                  {testCase.status === "passed" ? "✓" : "✗"}
                                </div>
                              </td>
                              <td className="p-2 border border-[#2d2d2d] text-gray-300">{testCase.input}</td>
                              <td className="p-2 border border-[#2d2d2d] text-gray-300">{testCase.expectedOutput}</td>
                              <td className="p-2 border border-[#2d2d2d] text-gray-300">
                                {testCase.actualOutput || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">Background Testcases</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#252525] text-left">
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Status</th>
                            <th className="p-2 border border-[#2d2d2d] text-gray-300">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testResults.hiddenTestCases.map((testCase, index) => (
                            <tr key={index} className="border-b border-[#2d2d2d]">
                              <td className="p-2 border border-[#2d2d2d]">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${testCase.status === "passed" ? "bg-green-600" : "bg-red-600"}`}
                                >
                                  {testCase.status === "passed" ? "✓" : "✗"}
                                </div>
                              </td>
                              <td className="p-2 border border-[#2d2d2d] text-gray-300">
                                {testCase.status === "passed" ? "Correct" : "Wrong Answer"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>Run your code to see test results</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Code editor */}
        <div className="w-1/2 flex flex-col border-l border-[#2d2d2d]">
          <div className="bg-[#1a1a1a] border-b border-[#2d2d2d] p-2 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-[#0091FF] mr-2">{"<>"}</span>
              <span className="text-white">Code</span>
            </div>
            <div className="flex items-center gap-2">
              <select className="bg-[#252525] text-white border border-[#2d2d2d] rounded px-2 py-1 text-sm">
                <option>Python</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full bg-[#1e1e1e] text-white font-mono p-4 overflow-y-auto">
              <pre className="text-gray-300">
                <code>
                  {problem.starterCode.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 text-gray-500 select-none">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Sample testcases */}
          <div className="border-t border-[#2d2d2d]">
            <div className="bg-[#1a1a1a] p-2 flex items-center">
              <span className="text-[#0091FF] mr-2">{"<>"}</span>
              <span className="text-white">Sample Testcases</span>
            </div>

            <div className="p-4 bg-[#1a1a1a]">
              <div className="flex mb-2">
                {problem.sampleTestCases.map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded-md mr-2 text-sm ${index === 0 ? "bg-[#0091FF] text-white" : "bg-[#252525] text-gray-300"}`}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Input</p>
                  <pre className="bg-[#252525] p-2 rounded text-gray-300 overflow-x-auto">
                    {problem.sampleTestCases[0].input}
                  </pre>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Output</p>
                  <pre className="bg-[#252525] p-2 rounded text-gray-300 overflow-x-auto">
                    {problem.sampleTestCases[0].expectedOutput}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Test navigation */}
        <div className="w-12 bg-[#1a1a1a] border-l border-[#2d2d2d] flex flex-col items-center py-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                index === 0
                  ? "bg-[#0091FF] text-white"
                  : solvedProblems.includes(index)
                    ? "bg-green-600 text-white"
                    : "bg-[#252525] text-gray-300"
              }`}
              onClick={() => handleNavigate(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-[#1a1a1a] border-t border-[#2d2d2d] p-3 flex items-center justify-between">
        <Button variant="outline" size="sm" className="text-gray-300 border-[#2d2d2d]" disabled={true}>
          Prev
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-[#0091FF] border-[#0091FF] hover:bg-[#0091FF]/10"
            onClick={() => handleRun(problem.starterCode)}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? "Running..." : "Run"}
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-[#0091FF] hover:bg-[#0091FF]/90 text-white"
            onClick={() => handleSubmit(problem.starterCode)}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        <Button variant="outline" size="sm" className="text-gray-300 border-[#2d2d2d]">
          Next
        </Button>
      </div>
    </div>
  )
}

