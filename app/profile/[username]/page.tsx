import { EnhancedProfile } from "@/components/enhanced-profile"
import { DashboardLayout } from "@/components/dashboard-layout"
import { prisma } from "@/lib/prisma"

interface ProfilePageProps {
  params: { username: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      username: true,
      bio: true,
      profilePic: true,
      // Add other fields you want to display
    },
  });

  return (
    <DashboardLayout>
      <EnhancedProfile user={user} />
    </DashboardLayout>
  )
}

