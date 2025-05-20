import type { ReactNode } from "react"
import Link from "next/link"

interface CategoryCardProps {
  title: string
  icon: ReactNode
  count: number
  color: string
}

export default function CategoryCard({ title, icon, count, color }: CategoryCardProps) {
  return (
    <Link href="#" className="group">
      <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-premium hover:shadow-card-hover transition-all duration-300 text-center">
        <div
          className={`p-3 rounded-full ${color} text-white mb-3 group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{count} courses</p>
      </div>
    </Link>
  )
}
