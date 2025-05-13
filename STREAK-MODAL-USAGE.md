# Streak Modal System

This document explains how to use the streak modal system in NexAcademy to display a streak calendar when a user establishes or maintains a streak.

## Overview

The streak modal system shows a popup modal with the user's current streak status, displaying the entire week from Sunday to Saturday with the current day highlighted. It's designed to be shown when:

1. A user completes a correct submission that establishes or maintains their daily streak
2. A user logs in and has an active streak

## Components

The system consists of several components:

- `StreakModal`: The visual modal component
- `useStreakModal`: A React hook to manage modal state and check for streaks
- `StreakIntegration`: A component that connects the modal with streak data
- `ProblemSolvingWrapper`: A wrapper component to listen for streak events
- `streak-helpers.ts`: Utility functions for handling streak data from GraphQL responses

## How to Use

### 1. Wrap Problem-Solving Pages

Wrap your problem-solving page with the `ProblemSolvingWrapper` component:

```tsx
import { ProblemSolvingWrapper } from "@/components/problem-solving-wrapper"

export default function ProblemPage() {
  return (
    <ProblemSolvingWrapper>
      {/* Your problem page content */}
    </ProblemSolvingWrapper>
  )
}
```

### 2. Process GraphQL Responses

When you receive a response from a code submission GraphQL mutation, process it to show the streak modal:

```tsx
import { processStreakResponse } from "@/utils/streak-helpers"
import { useMutation } from "@apollo/client"
import { SUBMIT_CODE } from "@/graphql/mutations"
import { useSession } from "next-auth/react"

function CodeSubmitButton() {
  const { data: session } = useSession()
  const [submitCode] = useMutation(SUBMIT_CODE)
  
  const handleSubmit = async () => {
    try {
      const response = await submitCode({
        variables: {
          input: {
            sourceCode: code,
            languageId: languageId,
            problemId: problemId
          }
        }
      })
      
      // Process streak data from the response
      if (response.data?.submitCode?.allTestsPassed) {
        processStreakResponse(response.data, session?.user?.id)
      }
    } catch (error) {
      console.error("Error submitting code:", error)
    }
  }
  
  return <button onClick={handleSubmit}>Submit Code</button>
}
```

### 3. Show Streak Modal Manually

You can also trigger the streak modal manually from anywhere in your application:

```tsx
import { showStreakModal } from "@/utils/streak-helpers"

function ShowStreakButton() {
  const handleClick = () => {
    // Show streak modal with current streak of 5 days and highest streak of 10 days
    showStreakModal(5, 10)
  }
  
  return <button onClick={handleClick}>Show Streak</button>
}
```

## GraphQL Schema

The GraphQL schema has been updated to include streak information in the submission response:

```graphql
type CodeExecutionResponse {
  success: Boolean!
  message: String!
  results: [TestCaseResult!]!
  allTestsPassed: Boolean!
  totalTests: Int
  executionId: String
  submissionId: String
  xp: XPInfo
  streakEstablished: Boolean  # Added field
  currentStreak: Int          # Added field
}
```

## Styling

The streak modal uses the application's design system and shows:

1. The user's current streak count
2. Their highest streak count
3. A visual calendar of the current week (Sunday to Saturday)
4. The current day highlighted
5. Days with activity marked with a checkmark

## Customization

To customize the appearance of the streak modal, modify the `StreakModal` component in `/components/streak-modal.tsx`.

## Backend Integration

The backend updates the streak when a user submits a correct solution using the `recordActivity` function in `lib/streak-service.ts`. The GraphQL resolver then includes this streak information in the response. 