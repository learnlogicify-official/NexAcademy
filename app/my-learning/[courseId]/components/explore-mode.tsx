"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ClipboardCheck, Code, Video } from "lucide-react"
import { VideosList } from "./videos-list"
import { ContentList } from "./content-list"
import { ProblemsList } from "./problems-list"
import { AssessmentsList } from "./assessments-list"

interface ExploreModeProps {
  modules: any[]
}

export function ExploreMode({ modules }: ExploreModeProps) {
  return (
    <Tabs defaultValue="videos" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Videos
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Learning Content
        </TabsTrigger>
        <TabsTrigger value="problems" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Practice Problems
        </TabsTrigger>
        <TabsTrigger value="assessments" className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Assessments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="videos">
        <VideosList modules={modules} />
      </TabsContent>

      <TabsContent value="content">
        <ContentList modules={modules} />
      </TabsContent>

      <TabsContent value="problems">
        <ProblemsList modules={modules} />
      </TabsContent>

      <TabsContent value="assessments">
        <AssessmentsList modules={modules} />
      </TabsContent>
    </Tabs>
  )
}
