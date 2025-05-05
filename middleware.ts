import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run this logic for the /onboarding page
  if (pathname.startsWith("/onboarding")) {
    // Get the user's session token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token?.hasOnboarded) {
      // Redirect to dashboard if already onboarded
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding"],
}; 