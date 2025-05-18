import { DashboardLayout } from "@/components/dashboard-layout"
import BannerHeader from "../components/banner-header"
import SocialTabs from "../components/social-tabs"

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      <div className="w-full min-h-screen pb-12 bg-gray-50 dark:bg-gray-900 flex flex-col p-4 z-10">
        {/* Banner header */}
        <BannerHeader />

        {/* Content tabs for navigation */}
        <SocialTabs />

        {/* Main explore feed content */}
        <div className="py-6 relative z-10">
          {children}
        </div>
      </div>
    </DashboardLayout>
  )
} 