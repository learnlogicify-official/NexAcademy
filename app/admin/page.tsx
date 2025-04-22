import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardStats } from "@/components/admin/dashboard-stats";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (!session.user.role) {
    redirect("/dashboard");
  }

  // Check if user is admin
  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your learning management system
        </p>
      </div>

      <DashboardStats />
    </div>
  );
} 