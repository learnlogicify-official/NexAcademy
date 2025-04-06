"\"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export function ProfileCourses() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Enrolled Courses</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">No courses enrolled yet.</p>
      </CardContent>
    </Card>
  )
}

