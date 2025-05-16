import { getUserProblemStats } from "../actions/nexpractice-actions"
import ClientWrapper from "./client-wrapper"

// Main CodeMaster component (server-side rendered)
export default async function CodeMaster() {
  // Fetch real data from server action
  const { totalSolved, streak } = await getUserProblemStats()

  return (
    <ClientWrapper totalSolved={totalSolved} streak={streak} />
  )
}


