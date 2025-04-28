"use client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LessonHeaderProps {
  courseId: string
  module: {
    order: number
    title: string
    description: string
    level: string
  }
}

export function LessonHeader({ courseId, module }: LessonHeaderProps) {
  const router = useRouter()
  const { title } = module

  return (
    <div className="flex items-center mb-5">
      <Button variant="ghost" size="icon" asChild className="mr-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50">
        <Link href={`/my-learning/${courseId}`}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Course</span>
        </Link>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    </div>
  )
}
