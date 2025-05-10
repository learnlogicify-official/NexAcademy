import { gql } from '@apollo/client';

export const codeExecutionTypeDefs = gql`
  # Status information about code execution
  type ExecutionStatus {
    id: Int!
    description: String!
  }

  # Result for an individual test case
  type TestCaseResult {
    id: String
    input: String!
    expectedOutput: String!
    actualOutput: String
    stderr: String
    compileOutput: String
    status: ExecutionStatus!
    verdict: String!
    isCorrect: Boolean!
    executionTime: String
    memoryUsed: String
  }

  # Response type for code execution operations
  type CodeExecutionResponse {
    success: Boolean!
    message: String!
    results: [TestCaseResult!]!
    allTestsPassed: Boolean!
    totalTests: Int
    executionId: String
  }
  
  # Execution progress type for subscriptions
  type ExecutionProgress {
    executionId: String!
    completedTests: Int!
    totalTests: Int!
    results: [TestCaseResult!]!
    message: String
  }

  # Additional Judge0 execution settings
  input Judge0Settings {
    cpu_time_limit: Float
    cpu_extra_time: Float
    wall_time_limit: Float
    memory_limit: Int
    stack_limit: Int
    compilation_time_limit: Float
    max_file_size: Int
    max_processes_and_or_threads: Int
  }

  # Input for code execution
  input CodeExecutionInput {
    sourceCode: String!
    languageId: Int!
    problemId: String!
    executeInParallel: Boolean
    executionId: String
    judge0Settings: Judge0Settings
  }

  # Extend the Query type to include code execution info
  extend type Query {
    codeExecutionInfo: String
  }

  # Code execution mutations
  extend type Mutation {
    runCode(input: CodeExecutionInput!): CodeExecutionResponse!
    submitCode(input: CodeExecutionInput!): CodeExecutionResponse!
  }
  
  # Code execution subscriptions
  extend type Subscription {
    executionProgress(executionId: String!): ExecutionProgress
  }
`; 