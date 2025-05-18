"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import Image from "next/image"

const topics = [
  {
    id: 1,
    name: "Spring Festival",
    posts: 248,
    trend: "up",
    category: "Events",
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 2,
    name: "AI Research",
    posts: 187,
    trend: "up",
    category: "Academic",
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 3,
    name: "Campus Renovation",
    posts: 132,
    trend: "up",
    category: "Announcements",
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 4,
    name: "Robotics Competition",
    posts: 95,
    trend: "new",
    category: "Engineering",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 5,
    name: "Study Abroad",
    posts: 63,
    trend: "up",
    category: "International",
    image: "https://images.unsplash.com/photo-1526080676457-4544bf0ebba9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

export default function TrendingTopics() {
  return (
    <Card className="overflow-hidden border-none shadow-md relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mt-16 -mr-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full -mb-12 -ml-12 blur-xl"></div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-bold">Trending Topics</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="group flex items-center space-x-3 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-blue-100">
                <Image 
                  src={topic.image} 
                  alt={topic.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                    #{topic.name}
                  </div>
                  {topic.trend === "new" && (
                    <Badge className="ml-2 bg-pink-600 hover:bg-pink-700 text-[10px] py-0 h-4">New</Badge>
                  )}
                </div>
                <div className="flex items-center text-[10px] text-gray-500">
                  <span>{topic.posts} posts</span>
                  <span className="mx-1">•</span>
                  <Badge variant="outline" className="text-[9px] py-0 h-4 border-gray-200">
                    {topic.category}
                  </Badge>
                </div>
              </div>
              {topic.trend === "up" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            See more topics
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
