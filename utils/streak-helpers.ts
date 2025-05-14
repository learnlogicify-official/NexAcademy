import { getCurrentUserStreak } from "@/app/actions/streak-actions"
import { triggerStreakModal } from "@/components/problem-solving-wrapper"

/**
 * Process a GraphQL submission response and show the streak modal if applicable
 * 
 * This function extracts streak data from GraphQL responses and triggers
 * the streak modal when a streak is established or maintained.
 * 
 * NOTE: The streak modal will only be shown when a user submits a correct solution,
 * not when just visiting the page. This is controlled by the streakEstablished flag
 * from the GraphQL response.
 * 
 * @param response The GraphQL response from a code submission
 * @param userId The current user's ID
 */
export async function processStreakResponse(
  response: any, 
  userId?: string | null
) {
  // Check if we have streak data in the response
  if (
    response?.submitCode?.streakEstablished && 
    response?.submitCode?.currentStreak
  ) {
    // If streak is established in the response, use that data
    const currentStreak = response.submitCode.currentStreak
    
    // Get the user's highest streak
    try {
      const userStreak = await getCurrentUserStreak()
      const highestStreak = userStreak?.longestStreak || currentStreak
      
      // Trigger the streak modal - only happens for correct submissions
      triggerStreakModal({
        streakEstablished: true,
        currentStreak,
        highestStreak
      })
      
      return {
        streakEstablished: true,
        currentStreak,
        highestStreak
      }
    } catch (error) {
      console.error("Error processing streak response:", error)
    }
  }
  
  // Return null if no streak was established or there was an error
  return null
}

/**
 * Show the streak modal directly based on streak data
 * 
 * NOTE: This function is for manual triggering only. For normal use,
 * the streak modal will be shown automatically on correct submission.
 * 
 * @param currentStreak The user's current streak count
 * @param highestStreak The user's highest streak count
 */
export function showStreakModal(currentStreak: number, highestStreak?: number) {
  // If highest streak is not provided, set it equal to current streak
  const highestStreakValue = highestStreak || currentStreak
  
  // Trigger the streak modal
  triggerStreakModal({
    streakEstablished: true,
    currentStreak,
    highestStreak: highestStreakValue
  })
} 