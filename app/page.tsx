import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user needs to complete onboarding
  if (session.user && !session.user.hasOnboarded) {
    redirect("/onboarding");
  }

  // If user is authenticated and has completed onboarding, redirect to dashboard
  redirect("/dashboard");
}

