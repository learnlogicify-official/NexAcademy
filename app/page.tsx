import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // TODO: Add logic to check if user is logged in and hasOnboarded is false, then redirect to /onboarding

  redirect("/dashboard");
}

