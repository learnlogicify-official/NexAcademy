export interface Course {
  id: string
  title: string
  description: string
  xpEarned: number
  totalXP: number
  progress: number
  lastModule?: string
  lastModuleTitle?: string
  modules: Module[]
  level: "Beginner" | "Intermediate" | "Advanced"
  instructor?: string
  duration?: string
  rating?: number
  students?: number
  price?: number
  thumbnail?: string
}

export interface Module {
  id: string
  title: string
  description: string
  xpAvailable: number
  status: "Locked" | "In Progress" | "Completed" | "Not Started"
  level: "Beginner" | "Intermediate" | "Advanced"
  order: number
  duration?: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "article" | "quiz" | "exercise"
  completed: boolean
  inProgress: boolean
}

export interface TestLevel {
  id: string
  title: string
  difficulty: "Easy" | "Intermediate" | "Challenge"
  description: string
  problemCount: number
  xpReward: number
  status: "Locked" | "Not Started" | "In Progress" | "Completed"
}

export interface Problem {
  id: string
  title: string
  difficulty: "Easy" | "Intermediate" | "Challenge"
  description: string
  xpReward: number
  inputFormat: string
  outputFormat: string
  sampleInput: string
  sampleOutput: string
  explanation: string
  constraints: string
  starterCode: string
}

export const pythonBasicsCourse: Course = {
  id: "python-basics",
  title: "Python Basics",
  description:
    "Learn the fundamentals of Python programming language including variables, control flow, functions, and data structures.",
  xpEarned: 450,
  totalXP: 1500,
  progress: 30,
  lastModule: "control-flow",
  lastModuleTitle: "Control Flow",
  level: "Beginner",
  modules: [
    {
      id: "variables-data-types",
      title: "Variables & Data Types",
      description: "Learn about variables, primitive data types, and basic operations in Python.",
      xpAvailable: 300,
      status: "Completed",
      level: "Beginner",
      order: 1,
    },
    {
      id: "control-flow",
      title: "Control Flow",
      description: "Master conditional statements and decision making in Python.",
      xpAvailable: 300,
      status: "In Progress",
      level: "Beginner",
      order: 2,
    },
    {
      id: "functions",
      title: "Functions",
      description: "Learn how to define and use functions to organize your code.",
      xpAvailable: 300,
      status: "Not Started",
      level: "Beginner",
      order: 3,
    },
    {
      id: "loops",
      title: "Loops",
      description: "Understand how to use loops for repetitive tasks in Python.",
      xpAvailable: 300,
      status: "Not Started",
      level: "Beginner",
      order: 4,
    },
    {
      id: "lists-tuples",
      title: "Lists & Tuples",
      description: "Work with collections of data using lists and tuples.",
      xpAvailable: 300,
      status: "Not Started",
      level: "Beginner",
      order: 5,
    },
  ],
}

export const moduleTestLevels: Record<string, TestLevel[]> = {
  "variables-data-types": [
    {
      id: "variables-easy",
      title: "Basic Variables",
      difficulty: "Easy",
      description: "Simple variable assignments and basic operations",
      problemCount: 10,
      xpReward: 100,
      status: "Completed",
    },
    {
      id: "variables-intermediate",
      title: "Data Type Operations",
      difficulty: "Intermediate",
      description: "Working with different data types and type conversions",
      problemCount: 10,
      xpReward: 100,
      status: "In Progress",
    },
    {
      id: "variables-challenge",
      title: "Advanced Operations",
      difficulty: "Challenge",
      description: "Complex operations and edge cases with variables",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
  ],
  "control-flow": [
    {
      id: "control-flow-easy",
      title: "Basic Conditionals",
      difficulty: "Easy",
      description: "Simple if-else statements and boolean logic",
      problemCount: 10,
      xpReward: 100,
      status: "In Progress",
    },
    {
      id: "control-flow-intermediate",
      title: "Nested Conditionals",
      difficulty: "Intermediate",
      description: "Working with nested if-else statements and complex conditions",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "control-flow-challenge",
      title: "Advanced Flow Control",
      difficulty: "Challenge",
      description: "Complex decision making and logical operations",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
  ],
  functions: [
    {
      id: "functions-easy",
      title: "Basic Functions",
      difficulty: "Easy",
      description: "Creating and calling simple functions",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "functions-intermediate",
      title: "Function Parameters",
      difficulty: "Intermediate",
      description: "Working with function parameters and return values",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "functions-challenge",
      title: "Advanced Functions",
      difficulty: "Challenge",
      description: "Recursion, lambda functions, and higher-order functions",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
  ],
  loops: [
    {
      id: "loops-easy",
      title: "Basic Loops",
      difficulty: "Easy",
      description: "Simple for and while loops",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "loops-intermediate",
      title: "Nested Loops",
      difficulty: "Intermediate",
      description: "Working with nested loops and loop control statements",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "loops-challenge",
      title: "Advanced Loop Patterns",
      difficulty: "Challenge",
      description: "Complex loop patterns and optimizations",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
  ],
  "lists-tuples": [
    {
      id: "lists-easy",
      title: "Basic Lists",
      difficulty: "Easy",
      description: "Creating and manipulating lists",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "lists-intermediate",
      title: "List Operations",
      difficulty: "Intermediate",
      description: "Advanced list operations and methods",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
    {
      id: "lists-challenge",
      title: "Tuples and Advanced Collections",
      difficulty: "Challenge",
      description: "Working with tuples and complex collection operations",
      problemCount: 10,
      xpReward: 100,
      status: "Not Started",
    },
  ],
}

export const sampleProblem: Problem = {
  id: "variables-easy-1",
  title: "Sum of Two Numbers",
  difficulty: "Easy",
  description: "Write a function `sum_two_numbers(a, b)` that takes two numbers as input and returns their sum.",
  xpReward: 10,
  inputFormat: "Two integers a and b.",
  outputFormat: "An integer representing the sum of a and b.",
  sampleInput: "5 7",
  sampleOutput: "12",
  explanation: "The sum of 5 and 7 is 12.",
  constraints: "1 <= a, b <= 10^9",
  starterCode: "def sum_two_numbers(a, b):\n    # Write your code here\n    pass",
}
