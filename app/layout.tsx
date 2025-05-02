import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import { ProfilePicProvider } from "@/components/ProfilePicContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexAcademy",
  description: "Gamified LMS Dashboard",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const initialPic = session?.user?.profilePic || ""
  const initialBanner = session?.user?.bannerImage || ""
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ProfilePicProvider initialPic={initialPic} initialBanner={initialBanner}>
          <Suspense fallback={<div>Loading...</div>}>
            <Providers>{children}</Providers>
          </Suspense>
        </ProfilePicProvider>
      </body>
    </html>
  )
}
