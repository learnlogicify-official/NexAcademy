import DashboardShell from "../../dashboard-shell"

export default function NexLearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We're returning the children directly because the DashboardShell is already applied
  // at the parent layout level (app/(dashboard)/layout.tsx)
  return children
} 