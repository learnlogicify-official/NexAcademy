"use client";

/**
 * Sign Up Page
 * 
 * This is a core authentication page that should not be modified without careful consideration.
 * The page follows a consistent layout pattern with:
 * - Left panel: AuthPanel component (shared across auth pages)
 * - Right panel: Sign up form and related content
 * 
 * Key features:
 * - Account creation form
 * - Social sign-up options (Google and GitHub)
 * - Link to sign in page for existing users
 * 
 * DO NOT MODIFY THIS PAGE WITHOUT UPDATING THE CORRESPONDING SIGN-IN PAGE
 * TO MAINTAIN CONSISTENCY IN THE AUTHENTICATION FLOW.
 */

import { Icons } from "@/components/icons";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <>
      {/* Left Panel */}
      <AuthPanel />

      {/* Right Panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Message */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Join NexAcademy</h2>
            <p className="text-muted-foreground">
              Start your learning journey and become a tech innovator
            </p>
          </div>

          {/* Sign Up Form */}
          <SignUpForm />

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

          {/* Social Sign Up */}
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

          {/* Existing User Section */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Already have an account? Sign in to continue your learning journey.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 