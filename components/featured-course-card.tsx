"use client"

import { Button } from "@/components/ui/button"
import { Star, Users, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeaturedCourseCardProps {
  title: string
  description: string
  instructor: string
  rating: number
  ratingCount: number
  students: number
  duration: string
  topics: number
  videos: number
  className?: string
}

export function FeaturedCourseCard({
  title,
  description,
  instructor,
  rating,
  ratingCount,
  students,
  duration,
  topics,
  videos,
  className,
}: FeaturedCourseCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500" />

      <div className="relative p-8 flex flex-col md:flex-row">
        {/* Left content */}
        <div className="flex-1 text-white">
          {/* Featured badge */}
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 mb-4">
            <span className="text-white text-sm">Featured Course</span>
          </div>

          {/* Course title */}
          <h1 className="text-4xl font-bold mb-3">{title}</h1>

          {/* Course description */}
          <p className="text-white/90 text-lg mb-6 max-w-2xl">{description}</p>

          {/* Course stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-300 mr-2 fill-yellow-300" />
              <span className="font-medium">{rating}</span>
              <span className="text-white/70 ml-1">({ratingCount})</span>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 text-white/70 mr-2" />
              <span>{students.toLocaleString()} students</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 text-white/70 mr-2" />
              <span>{duration}</span>
            </div>
          </div>

          {/* Enroll button */}
          <Button className="bg-white text-primary hover:bg-white/90 px-6 rounded-full">
            <span className="mr-2">Enroll Now</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right content - Instructor card */}
        <div className="mt-8 md:mt-0 md:ml-8 bg-blue-400/20 backdrop-blur-sm rounded-xl p-6 text-white text-center min-w-[250px]">
          {/* Instructor logo */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-white flex items-center justify-center rounded-xl">
              <span className="text-5xl font-bold text-blue-500">TF</span>
            </div>
          </div>

          {/* Instructor info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium">Instructor</h3>
            <p className="text-xl font-semibold">{instructor}</p>
          </div>

          {/* Course stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{topics}</div>
              <div className="text-sm text-white/80">Topics</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{videos}</div>
              <div className="text-sm text-white/80">Videos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
