import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  value: string
  label: string
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-premium hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
