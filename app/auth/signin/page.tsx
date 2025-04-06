"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icons } from "@/components/icons";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { useSnackbar } from "notistack";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const hasShownMessage = useRef(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success && !hasShownMessage.current) {
      hasShownMessage.current = true;
      if (success === "account_created") {
        enqueueSnackbar("Account created successfully! Please sign in with your credentials.", {
          variant: "success",
          autoHideDuration: 5000,
        });
      } else if (success === "signed_out") {
        enqueueSnackbar("Signed out successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign In */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Icons.github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

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