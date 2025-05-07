export interface TestCase {
  id: number
  input: string
  expectedOutput: string
  actualOutput?: string
  status?: "passed" | "failed" | "pending"
}

export interface Problem {
  id: string
  number: number
  title: string
  difficulty: "Easy" | "Intermediate" | "Challenge"
  tags: string[]
  level: number
  description: string
  inputFormat: string
  outputFormat: string
  constraints: string[]
  sampleTestCases: TestCase[]
  hiddenTestCases: TestCase[]
  starterCode: string
  solution: string
  explanation: string
  xpReward: number
}



// Mock data for the problem set


