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

export const sampleProblem: Problem = {
  id: "print-numbers",
  number: 3,
  title: "Print Numbers from 1 to N",
  difficulty: "Easy",
  tags: ["Looping", "Basics"],
  level: 1,
  description:
    "Write a program that prints all integers sequentially from 1 to a given number N. The program should take a single integer as input and output the numbers in increasing order, separated by spaces.",
  inputFormat: "The program accepts a single integer num, which represents the upper limit of the sequence (N).",
  outputFormat: "The output should display all numbers from 1 to num, separated by spaces.",
  constraints: [
    "1 ≤ N ≤ 1000 (if applicable, otherwise remove constraints).",
    "The program should ensure efficient execution even for larger values of N.",
  ],
  sampleTestCases: [
    {
      id: 1,
      input: "5",
      expectedOutput: "1 2 3 4 5",
      status: "pending",
    },
    {
      id: 2,
      input: "10",
      expectedOutput: "1 2 3 4 5 6 7 8 9 10",
      status: "pending",
    },
    {
      id: 3,
      input: "1",
      expectedOutput: "1",
      status: "pending",
    },
  ],
  hiddenTestCases: [
    {
      id: 1,
      input: "20",
      expectedOutput: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20",
      status: "pending",
    },
    {
      id: 2,
      input: "100",
      expectedOutput:
        "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100",
      status: "pending",
    },
  ],
  starterCode:
    "def print_numbers(n):\n    # Write your code here\n    pass\n\n# Read input\nn = int(input())\n\n# Call the function\nprint_numbers(n)",
  solution:
    "def print_numbers(n):\n    result = ' '.join(str(i) for i in range(1, n+1))\n    print(result)\n\n# Read input\nn = int(input())\n\n# Call the function\nprint_numbers(n)",
  explanation: "The input number N is 5. The program prints all numbers from 1 to 5, separated by spaces.",
  xpReward: 10,
}

// Mock data for the problem set
export const problemSet: Problem[] = [
  sampleProblem,
  // Add more problems as needed
]

