import { getServerSession } from "next-auth";
import { Dashboard } from "@/components/dashboard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // No need to check for session here as it's already checked in the layout

  // Random ID to prove this component reloads while shell persists
  const pageId = Math.floor(Math.random() * 10000);

  return (
    <>
      {/* Hidden debug info to verify page changes */}
      <div className="text-[8px] text-blue-400 fixed bottom-0 right-0 opacity-50 z-50">
        Dashboard Page ID: {pageId}
      </div>
      <Dashboard user={session!.user} />
    </>
  );
} 