import { gql } from '@apollo/client';

// GraphQL mutation for running code against sample test cases
export const RUN_CODE = gql`
  mutation RunCode($input: CodeExecutionInput!) {
    runCode(input: $input) {
      success
      message
      results {
        id
        input
        expectedOutput
        actualOutput
        stderr
        compileOutput
        status {
          id
          description
        }
        verdict
        isCorrect
        executionTime
        memoryUsed
      }
      allTestsPassed
      totalTests
    }
  }
`;

// GraphQL mutation for submitting code against all test cases
export const SUBMIT_CODE = gql`
  mutation SubmitCode($input: CodeExecutionInput!) {
    submitCode(input: $input) {
      success
      message
      results {
        id
        input
        expectedOutput
        actualOutput
        stderr
        compileOutput
        status {
          id
          description
        }
        verdict
        isCorrect
        executionTime
        memoryUsed
      }
      allTestsPassed
      totalTests
      executionId
      submissionId
      xp {
        awarded
        amount
        newTotal
        levelUp
        newLevel
        streakInfo {
          currentStreak
          streakUpdated
          streakMaintained
          freezeUsed
          longestStreak
        }
      }
      streakEstablished
      currentStreak
      highestStreak
    }
  }
`;

// GraphQL subscription for execution progress
export const EXECUTION_PROGRESS_SUBSCRIPTION = gql`
  subscription ExecutionProgress($executionId: String!) {
    executionProgress(executionId: $executionId) {
      executionId
      completedTests
      totalTests
      results {
        id
        input
        expectedOutput
        actualOutput
        stderr
        compileOutput
        status {
          id
          description
        }
        verdict
        isCorrect
        executionTime
        memoryUsed
      }
      message
    }
  }
`; 