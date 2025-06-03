import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import "./nexpractice/styles/animations.css"
import { Suspense } from "react"
import { Providers } from "./providers"
import { ProfilePicProvider } from "@/components/ProfilePicContext"
import { PlatformDataProvider } from "@/lib/platformDataContext"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexAcademy",
  description: "Building Better Engineers",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const initialPic = session?.user?.profilePic || ''
  const initialBanner = session?.user?.bannerImage || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ProfilePicProvider initialPic={initialPic} initialBanner={initialBanner}>
          <Suspense fallback={<div>Loading...</div>}>
            <Providers>
              <PlatformDataProvider>
                {children}
              </PlatformDataProvider>
            </Providers>
          </Suspense>
        </ProfilePicProvider>
      </body>
    </html>
  )
}
