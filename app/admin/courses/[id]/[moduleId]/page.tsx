"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonHeader } from "@/components/lesson-header"
import { VideoSection } from "@/components/video-section"
import { ContentSection } from "@/components/content-section"
import { PracticeSection } from "@/components/practice-section"
import { AssessmentSection } from "@/components/assessment-section"
import { ChapterIntroSection } from "@/components/chapter-intro-section"
import { BookOpen, ClipboardCheck, Code, FileText, Video, Pencil, Info, Edit, Eye, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export default function LessonPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const resolvedParams = use(params) as { id: string; moduleId: string };
  const { id, moduleId } = resolvedParams;
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("intro");
  const [module, setModule] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/modules/${moduleId}`)
      .then(res => res.json())
      .then(data => {
        setModule(data);
        if (data?.course?.id && !data.course.title) {
          fetch(`/api/courses/${data.course.id}`)
            .then(res => res.json())
            .then(courseData => setCourse(courseData));
        } else if (data?.course) {
          setCourse(data.course);
        }
        setLoading(false);
      });
  }, [moduleId]);

  if (loading || !module) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-black/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-full mb-4" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    );
  }

  // Floating action button for admin actions
  const handleEditModule = () => router.push(`/admin/courses/${id}/${moduleId}/edit`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-background p-2 sm:p-4">
      {/* Top navigation with breadcrumbs */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-gray-800/50 hover:bg-gray-700/50">
            <Link href={`/admin/courses/${module?.course?.id || id}`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Course</span>
            </Link>
          </Button>
          <nav className="flex items-center text-sm text-muted-foreground gap-1">
            <Link href="/admin/courses" className="hover:text-foreground transition-colors">Courses</Link>
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            {course ? (
              <Link href={`/admin/courses/${course.id}`} className="hover:text-foreground transition-colors">{course.title}</Link>
            ) : (
              <span className="text-muted-foreground">Course</span>
            )}
            <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">{module.title}</span>
          </nav>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-xs">
            Module {module.order}
          </Badge>
          {module.course?.level && (
            <Badge variant="secondary" className="text-xs">
              {module.course.level}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {/* Compact header with quick info */}
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card/70 border-primary/10 shadow-lg">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{module.title}</h1>
                <p className="text-muted-foreground text-sm line-clamp-1">
                  {module.description || "No description available"}
                </p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  title="View module"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={handleEditModule}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
            
            {/* Quick stats strip */}
            <div className="bg-black/10 border-t border-primary/5 py-2 px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="font-medium">~ 60 min</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  <span className="text-muted-foreground">Videos: </span>
                  <span className="font-medium">{module.videos?.length || 0}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  <span className="text-muted-foreground">Content: </span>
                  <span className="font-medium">2 sections</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  <span className="text-muted-foreground">Exercises: </span>
                  <span className="font-medium">4 items</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern streamlined tabs with content */}
        <Card className="flex-1 overflow-hidden border bg-card/90 shadow-md">
          <Tabs 
            value={activeSection} 
            onValueChange={setActiveSection}
            className="flex flex-col h-full"
          >
            <div className="px-2 border-b bg-muted/20">
              <TabsList className="h-14 bg-transparent w-full justify-start gap-2 px-2">
                <TabsTrigger 
                  value="intro" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2 h-10"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2 h-10"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2 h-10"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2 h-10"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Practice
                </TabsTrigger>
                <TabsTrigger 
                  value="assessment" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md px-3 py-2 h-10"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Quiz
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Chapter Intro section */}
              <TabsContent value="intro" className="p-0 m-0 h-full data-[state=active]:flex">
                <ChapterIntroSection module={module} />
              </TabsContent>

              {/* Video section */}
              <TabsContent value="video" className="p-0 m-0 h-full data-[state=active]:flex">
                <VideoSection module={module} />
              </TabsContent>

              {/* Content section */}
              <TabsContent value="content" className="p-0 m-0 h-full data-[state=active]:flex">
                <ContentSection module={module} />
              </TabsContent>

              {/* Practice section */}
              <TabsContent value="practice" className="p-0 m-0 h-full data-[state=active]:flex">
                <PracticeSection module={module} isAdmin={true} />
              </TabsContent>

              {/* Assessment section */}
              <TabsContent value="assessment" className="p-0 m-0 h-full data-[state=active]:flex">
                <AssessmentSection module={module} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* Floating Action Button for Admin Actions */}
      <Button
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        size="icon"
        onClick={handleEditModule}
        title="Edit Module"
      >
        <Pencil className="h-5 w-5" />
      </Button>
    </div>
  );
}
 