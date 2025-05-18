import DashboardShell from "../dashboard-shell"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Loader from "@/components/loader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  // Redirect to onboarding if user hasn't completed it
  if (session.user && !session.user.hasOnboarded) {
    redirect("/onboarding")
  }
  
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader /></div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
} 