"use client";

/**
 * Sign In Page
 * 
 * This is a core authentication page that should not be modified without careful consideration.
 * The page follows a consistent layout pattern with:
 * - Left panel: AuthPanel component (shared across auth pages)
 * - Right panel: Sign in form and related content
 * 
 * Key features:
 * - Automatic redirect to dashboard if user is already signed in
 * - Success notifications for account creation and sign out
 * - Social sign-in options (Google and GitHub)
 * - Link to sign up page for new users
 * 
 * DO NOT MODIFY THIS PAGE WITHOUT UPDATING THE CORRESPONDING SIGN-UP PAGE
 * TO MAINTAIN CONSISTENCY IN THE AUTHENTICATION FLOW.
 */

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSnackbar } from "notistack";
import { SignInForm } from "@/components/auth/signin-form";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import Loading from "@/app/loading";

function SignInContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const messageShownRef = useRef(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success && !messageShownRef.current) {
      messageShownRef.current = true;
      if (success === "signed_out") {
        enqueueSnackbar("Signed out successfully!", { variant: "success" });
      } else if (success === "account_created") {
        enqueueSnackbar("Account created successfully! Please sign in.", { variant: "success" });
      }
    }
  }, [searchParams, enqueueSnackbar]);

  return (
    <>
      {/* Left Panel */}
      <AuthPanel />

      {/* Right Panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Message */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
            <p className="text-muted-foreground">
              Sign in to continue your learning journey with NexAcademy
            </p>
          </div>

          {/* Sign In Form */}
          <SignInForm />

          {/* New User Section */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              New to NexAcademy? Join our community of learners and start your tech journey today!
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signup">
                Create an account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignInContent />
    </Suspense>
  );
} 