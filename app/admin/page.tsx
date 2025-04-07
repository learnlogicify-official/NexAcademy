import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Role } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  console.log('Session:', session);
  console.log('User role:', session?.user?.role);
  console.log('Role type:', typeof session?.user?.role);
  console.log('Role.ADMIN:', Role.ADMIN);
  console.log('Role.ADMIN type:', typeof Role.ADMIN);

  if (!session?.user) {
    console.log('No session found, redirecting to signin');
    redirect("/auth/signin");
  }

  if (!session.user.role) {
    console.log('No role found in session, redirecting to dashboard');
    redirect("/dashboard");
  }

  // Check if user is admin
  if (session.user.role !== Role.ADMIN) {
    console.log('User is not admin, redirecting to dashboard');
    redirect("/dashboard");
  }

  return <AdminDashboard />;
} 