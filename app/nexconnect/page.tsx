import SocialTabs from "./components/social-tabs"
import SocialFeed from "./components/social-feed"
import BannerHeader from "./components/banner-header"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NexConnect | Campus Social Platform",
  description: "Connect with your campus community, share updates, and discover events.",
}

export default function Home() {
  return (
    <DashboardLayout>
      <div className="w-full min-h-screen pb-12 bg-gray-50 dark:bg-gray-900 flex flex-col p-4 z-10">
        {/* Banner header */}
        <BannerHeader />

        {/* Content tabs for navigation */}
        <SocialTabs />

        {/* Main social feed content */}
        <div className="py-6 relative z-10">
          <SocialFeed />
        </div>
      </div>
    </DashboardLayout>
  )
}
