"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { type Problem, sampleProblem } from "@/data/problems"
import { ArrowLeft, Clock, Play, Send, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ProblemSolvingPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = params.id as string

  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState("")
  const [activeTab, setActiveTab] = useState("description")
  const [activeTestTab, setActiveTestTab] = useState("1")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [testResults, setTestResults] = useState<{
    sampleTestCases: Problem["sampleTestCases"]
    hiddenTestCases: Problem["hiddenTestCases"]
    allPassed: boolean
  } | null>(null)
  const [solvedProblems, setSolvedProblems] = useState<number[]>([])

  useEffect(() => {
    // In a real app, this would fetch from an API
    setProblem(sampleProblem)
    if (sampleProblem) {
      setCode(sampleProblem.starterCode)
    }

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

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const handleRun = () => {
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

  const handleSubmit = () => {
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

        setSolvedProblems((prev) => [...prev, Number.parseInt(problemId)])
        setActiveTab("testResult")
      }

      setIsSubmitting(false)
    }, 2000)
  }

  const handleBack = () => {
    router.push("/courses") // Return to courses page
  }

  const handleNavigate = (index: number) => {
    // In a real app, this would navigate to a different problem
    router.push(`/problem-solving/${index + 1}`)
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

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0091FF]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] overflow-hidden">
      {/* Problem header */}
      <header className="flex items-center justify-between p-3 bg-[#1a1a1a] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Exit
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#0091FF] to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              CQ
            </div>
            <span className="text-white font-medium">CodeQuest: Problem Solving</span>
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
          <Button
            variant="outline"
            size="sm"
            className="text-gray-300 border-[#2d2d2d]"
            onClick={() => router.push("/")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Problem description */}
        <div className="w-1/2 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="bg-[#1a1a1a] border-b border-[#2d2d2d] p-2">
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
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="description" className="m-0 p-0 h-full">
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
                    <h2 className="text-lg font-semibold text-white mb-2">Sample:</h2>
                    {problem.sampleTestCases.map((testCase, index) => (
                      <div key={index} className="mb-6">
                        <h3 className="font-medium text-white mb-2">Sample {index + 1}:</h3>
                        <div className="grid grid-cols-2 gap-4 bg-[#1a1a1a] rounded-md overflow-hidden border border-[#2d2d2d]">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Input</h4>
                            <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto text-sm">
                              {testCase.input}
                            </pre>
                          </div>
                          <div className="p-4 border-l border-[#2d2d2d]">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Output</h4>
                            <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto text-sm">
                              {testCase.expectedOutput}
                            </pre>
                          </div>
                        </div>
                        {testCase.explanation && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Explanation:</h4>
                            <p className="text-gray-300 text-sm">{testCase.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="testResult" className="m-0 p-0 h-full">
                <div className="p-6 space-y-6">
                  {testResults ? (
                    <>
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Sample Testcases</h2>

                        <div className="mb-4">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              testResults.allPassed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {testResults.allPassed ? "Accepted ✓" : "Wrong Answer ✗"}
                          </div>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-md border border-[#2d2d2d] overflow-hidden">
                          <div className="flex border-b border-[#2d2d2d] bg-[#252525]">
                            <div className="w-20 p-3 text-sm font-medium text-gray-400">Status</div>
                            <div className="w-1/4 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">
                              Input
                            </div>
                            <div className="w-1/3 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">
                              Expected
                            </div>
                            <div className="flex-1 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">
                              Got
                            </div>
                          </div>

                          {testResults.sampleTestCases.map((testCase, index) => (
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

                        <div
                          className={`mb-4 p-4 rounded-md ${
                            testResults.allPassed
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-red-500/10 border border-red-500/30"
                          }`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`text-xl mr-2 ${testResults.allPassed ? "text-green-500" : "text-red-500"}`}
                            >
                              {testResults.allPassed ? "✓" : "✗"}
                            </span>
                            <span
                              className={`font-medium ${testResults.allPassed ? "text-green-500" : "text-red-500"}`}
                            >
                              {testResults.allPassed
                                ? "Success: All test cases passed! 🎉"
                                : "Error: Some test cases failed."}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-md border border-[#2d2d2d] overflow-hidden">
                          <div className="flex border-b border-[#2d2d2d] bg-[#252525]">
                            <div className="w-20 p-3 text-sm font-medium text-gray-400">Status</div>
                            <div className="flex-1 p-3 text-sm font-medium text-gray-400 border-l border-[#2d2d2d]">
                              Result
                            </div>
                          </div>

                          {testResults.hiddenTestCases.map((testCase, index) => (
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
                                {testCase.status === "passed"
                                  ? "Correct"
                                  : testCase.status === "failed"
                                    ? "Wrong Answer"
                                    : "Pending"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>Run your code to see test results</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
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
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-full bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Sample testcases */}
          <div className="border-t border-[#2d2d2d]">
            <div className="bg-[#1a1a1a] p-2 flex items-center">
              <span className="text-[#0091FF] mr-2">{"<>"}</span>
              <span className="text-white">Sample Testcases</span>
            </div>

            <div className="p-4 bg-[#1a1a1a]">
              <Tabs value={activeTestTab} onValueChange={setActiveTestTab}>
                <TabsList className="bg-[#252525] mb-4">
                  {problem.sampleTestCases.map((testCase) => (
                    <TabsTrigger
                      key={testCase.id}
                      value={testCase.id.toString()}
                      className="data-[state=active]:bg-[#0091FF] data-[state=active]:text-white"
                    >
                      Case {testCase.id}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {problem.sampleTestCases.map((testCase) => (
                  <TabsContent key={testCase.id} value={testCase.id.toString()} className="m-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Input</h3>
                        <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto text-sm">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Output</h3>
                        <pre className="bg-[#252525] p-3 rounded-md text-gray-300 overflow-x-auto text-sm">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right sidebar - Test navigation */}
        <div className="w-12 bg-[#1a1a1a] border-l border-[#2d2d2d] flex flex-col items-center py-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={index}
              className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                index === Number.parseInt(problemId) - 1
                  ? "bg-[#0091FF] text-white"
                  : solvedProblems.includes(index + 1)
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
        <Button
          variant="outline"
          size="sm"
          className="text-gray-300 border-[#2d2d2d]"
          onClick={() => handleNavigate(Number.parseInt(problemId) - 2)}
          disabled={Number.parseInt(problemId) <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-[#0091FF] border-[#0091FF] hover:bg-[#0091FF]/10"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <span className="flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-[#0091FF] rounded-full"></div>
                Running...
              </span>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-[#0091FF] hover:bg-[#0091FF]/90 text-white"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-white rounded-full"></div>
                Submitting...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Submit
              </>
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-gray-300 border-[#2d2d2d]"
          onClick={() => handleNavigate(Number.parseInt(problemId))}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

