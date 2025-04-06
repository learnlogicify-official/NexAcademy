"use client";

import { Icons } from "@/components/icons";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
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