import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import OnboardingClientPage from "@/components/onboarding/onboarding-client-page"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.hasOnboarded) {
    redirect("/dashboard")
  }
  return <OnboardingClientPage />
}
