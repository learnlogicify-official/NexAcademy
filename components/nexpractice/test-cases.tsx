"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, Check, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Judge0Result } from "@/utils/judge0"

interface TestCase {
  id?: string
  input: any // can be string, object, or array
  expectedOutput: any // can be string, object, or array
  status?: string
}

// Helper to format output for better display
function formatValue(val: any) {
  if (typeof val === 'string') {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(val)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return val
    }
  } else if (typeof val === 'object') {
    return JSON.stringify(val, null, 2)
  } else {
    return String(val)
  }
}

interface TestCasesProps {
  sampleTestCases?: TestCase[];
  judgeResults?: Judge0Result[];
  loading?: boolean;
}

export function TestCases({ sampleTestCases, judgeResults, loading = false }: TestCasesProps) {
  const [activeCase, setActiveCase] = useState(0)
  const [cases, setCases] = useState<TestCase[]>([])
  const [loadingState, setLoadingState] = useState(true)
  const [copiedInput, setCopiedInput] = useState<number | null>(null)
  const [copiedOutput, setCopiedOutput] = useState<number | null>(null)
  const [copiedExpected, setCopiedExpected] = useState<number | null>(null)

  // Initialize or update test cases when sampleTestCases prop changes
  useEffect(() => {
    setLoadingState(true)
    
    // Simulate a short loading delay for a smoother UX
    const timer = setTimeout(() => {
      // Use provided test cases or fallback to hardcoded
      const testCases = sampleTestCases && sampleTestCases.length > 0 
        ? sampleTestCases 
        : [
          { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
          { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
          { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
        ]
      
      setCases(testCases)
      setLoadingState(false)
    }, 1000) // Short delay for visual consistency
    
    return () => clearTimeout(timer)
  }, [sampleTestCases])

  const copyToClipboard = (text: string, type: 'input' | 'output' | 'expected', index: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(index);
      setTimeout(() => setCopiedInput(null), 2000);
    } else if (type === 'output') {
      setCopiedOutput(index);
      setTimeout(() => setCopiedOutput(null), 2000);
    } else {
      setCopiedExpected(index);
      setTimeout(() => setCopiedExpected(null), 2000);
    }
  };

  if (loadingState) {
    return (
      <div className="flex items-center justify-center p-8 h-40 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-dashed border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading test cases...</p>
        </div>
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-md border border-dashed border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-muted-foreground">No test cases available for this problem.</p>
      </div>
    )
  }

  // Match judge results with test cases if available
  const getJudgeResultForCase = (index: number) => {
    if (!judgeResults || judgeResults.length <= index) {
      return null;
    }
    return judgeResults[index];
  };

  // Get verdict styling
  const getVerdictStyle = (verdict?: string) => {
    if (!verdict) return { 
      background: "bg-gray-50", 
      text: "text-gray-400",
      icon: null
    };
    
    switch (verdict) {
      case "Accepted":
        return { 
          background: "bg-green-50", 
          text: "text-green-600",
          icon: <CheckCircle2 className="h-4 w-4" />
        };
      case "Wrong Answer":
        return { 
          background: "bg-red-50", 
          text: "text-red-600",
          icon: <XCircle className="h-4 w-4" />
        };
      case "Compile Error":
      case "Runtime Error":
        return { 
          background: "bg-amber-50", 
          text: "text-amber-600",
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case "Running":
        return { 
          background: "bg-blue-50", 
          text: "text-blue-600",
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        };
      default:
        return { 
          background: "bg-gray-50", 
          text: "text-gray-400",
          icon: null
        };
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={`case${activeCase + 1}`} className="w-full">
        <TabsList className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
          {cases.map((tc, idx) => {
            const judgeResult = getJudgeResultForCase(idx);
            const verdict = judgeResult?.verdict;
            const { text, icon } = getVerdictStyle(verdict);
            
            return (
          <TabsTrigger
                key={idx}
                value={`case${idx + 1}`}
                className={`flex-1 rounded-md text-xs py-1 ${activeCase === idx ? "bg-white dark:bg-gray-700 shadow" : "bg-transparent"}`}
                onClick={() => setActiveCase(idx)}
          >
                <span className="flex items-center gap-1.5">
                  {loading ? 
                    <Loader2 className="h-3 w-3 animate-spin" /> : 
                    icon || null
                  }
                  Test {idx + 1}
                  {verdict && !loading && (
                    <span className={`ml-1 ${text} text-xs`}>
                      ({verdict === "Accepted" ? "✓" : verdict === "Wrong Answer" ? "✗" : "!"})
                    </span>
                  )}
                </span>
          </TabsTrigger>
            )
          })}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md" disabled>
            +
          </Button>
        </TabsList>

        {cases.map((tc, idx) => {
          const judgeResult = getJudgeResultForCase(idx);
          const verdict = judgeResult?.verdict;
          const { background, text, icon } = getVerdictStyle(verdict);
          
          return (
            <TabsContent key={idx} value={`case${idx + 1}`} className="mt-4">
              <div className="space-y-4 border rounded-md p-4">
                {/* Result badge shown if we have a verdict */}
                {verdict && (
                  <div className={`flex items-center gap-2 ${background} ${text} rounded-md px-3 py-2 border`}>
                    {icon}
                    <span className="font-medium">{verdict}</span>
                    {loading && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
                  </div>
                )}
                
                {/* Input section */}
            <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs font-normal bg-background dark:bg-gray-800">
                        Input
                      </Badge>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(formatValue(tc.input), 'input', idx)}
                          >
                            {copiedInput === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{copiedInput === idx ? "Copied!" : "Copy input"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
            </div>
                  <div className="relative">
                    <textarea
                      value={formatValue(tc.input)}
                      readOnly
                      className="w-full p-3 border rounded-md bg-white dark:bg-gray-900 font-mono text-sm shadow-sm"
                      rows={Math.min(4, Math.max(2, formatValue(tc.input).split('\n').length))}
              />
            </div>
          </div>

                {/* Expected Output section */}
            <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 text-xs font-normal bg-background dark:bg-gray-800 border-green-200 text-green-700 dark:text-green-400">
                        Expected Output
                      </Badge>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(formatValue(tc.output), 'expected', idx)}
                          >
                            {copiedExpected === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{copiedExpected === idx ? "Copied!" : "Copy expected output"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
            </div>
                  <div className="relative">
                    <textarea
                      value={formatValue(tc.output)}
                readOnly
                      className="w-full p-3 border rounded-md bg-white dark:bg-gray-900 font-mono text-sm shadow-sm"
                      rows={Math.min(4, Math.max(2, formatValue(tc.output).split('\n').length))}
              />
            </div>
          </div>

                {/* Your Output section */}
            <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className={`mr-2 text-xs font-normal bg-background dark:bg-gray-800 ${verdict ? `${text} border-${text.replace('text-', '')}-200` : ''}`}>
                        Your Output
                      </Badge>
                    </div>
                    {judgeResult?.output && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => copyToClipboard(formatValue(judgeResult.output), 'output', idx)}
                            >
                              {copiedOutput === idx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>{copiedOutput === idx ? "Copied!" : "Copy your output"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="relative">
                    {loading ? (
                      <div className="flex items-center justify-center h-[80px] border rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-blue-600 dark:text-blue-400">Running test case...</span>
                        </div>
                      </div>
                    ) : judgeResult?.output ? (
                      <textarea
                        value={formatValue(judgeResult.output)}
                readOnly
                        className={`w-full p-3 border rounded-md font-mono text-sm shadow-sm ${background}`}
                        rows={Math.min(4, Math.max(2, (judgeResult.output.split('\n').length || 1)))}
              />
                    ) : (
                      <div className="flex items-center justify-center h-[80px] border rounded-md bg-gray-50 dark:bg-gray-800/30 p-4">
                        <span className="text-gray-400 dark:text-gray-500">Click "Run" to see your output for this test case</span>
            </div>
                    )}
            </div>
                </div>
                
                {/* Show error messages if any */}
                {judgeResult?.stderr && (
                  <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800/30">
                    <div className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                      Runtime Error:
                    </div>
                    <pre className="text-xs text-orange-700 dark:text-orange-400 whitespace-pre-wrap font-mono">
                      {judgeResult.stderr}
                    </pre>
                  </div>
                )}
                
                {judgeResult?.compile_output && (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800/30">
                    <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      Compile Error:
                    </div>
                    <pre className="text-xs text-amber-700 dark:text-amber-400 whitespace-pre-wrap font-mono">
                      {judgeResult.compile_output}
                    </pre>
                  </div>
                )}
          </div>
        </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
