"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Video } from "lucide-react"

interface VideosListProps {
  modules: any[]
}

export function VideosList({ modules }: VideosListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden border-0 shadow-md bg-[#121212]">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-600" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="font-medium">{module.title} - Introduction</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{module.level}</Badge>
                  <span className="text-sm text-gray-400">12:34</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
