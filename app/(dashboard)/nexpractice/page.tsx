import { getUserProblemStats } from "../../actions/nexpractice-actions"
import ClientWrapper from "../../nexpractice/client-wrapper"

// Main CodeMaster component (server-side rendered)
export default async function CodeMaster() {
  // Fetch real data from server action
  const { totalSolved, streak } = await getUserProblemStats()

  // Random ID to prove this component reloads while shell persists
  const pageId = Math.floor(Math.random() * 10000);

  return (
    <>
      {/* Hidden debug info to verify page changes */}
      <div className="text-[8px] text-blue-400 fixed bottom-0 right-0 opacity-50 z-50">
        NexPractice Page ID: {pageId}
      </div>
      <ClientWrapper totalSolved={totalSolved} streak={streak} />
    </>
  )
} 