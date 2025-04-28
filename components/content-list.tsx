"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface ContentListProps {
  modules: any[]
}

export function ContentList({ modules }: ContentListProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Learning Content</h2>
      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden border-0 shadow-md bg-[#121212]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{module.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
