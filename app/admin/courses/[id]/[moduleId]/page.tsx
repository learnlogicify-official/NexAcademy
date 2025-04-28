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
import { BookOpen, ClipboardCheck, Code, FileText, Video, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-full max-w-md mb-4" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    );
  }

  // Floating action button for admin actions
  const handleEditModule = () => router.push(`/admin/courses/${id}/${moduleId}/edit`);

  return (
    <div className="pt-2 px-1 sm:px-3 max-w-5xl mx-auto">
      {/* Breadcrumbs and back button */}
      <div className="flex items-center gap-2 mb-4">
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

      {/* Modern glassy header card */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-background/70 shadow-xl border border-primary/10 backdrop-blur-lg overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-3 py-1 rounded-full tracking-wider uppercase">
                Module {module.order}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
              {module.title}
            </h1>
            <p className="text-muted-foreground text-base mb-2 max-w-2xl">
              {module.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            {module.course?.level && (
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-sm px-4 py-1">
                {module.course.level}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-primary/20 hover:bg-primary/10 transition"
              title="Edit Module"
              onClick={handleEditModule}
            >
              <Pencil className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modern tabs with pill/underline style */}
      <div className="rounded-2xl bg-card/80 shadow-lg border border-border overflow-hidden">
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mb-4 grid grid-cols-5 w-full max-w-3xl mx-auto bg-background/80 rounded-full p-1 mt-4">
            <TabsTrigger value="intro" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Intro</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden p-4 sm:p-8">
            {/* Chapter Intro section */}
            <TabsContent value="intro" className="h-full mt-0 overflow-hidden">
              <ChapterIntroSection module={module} />
            </TabsContent>

            {/* Video section */}
            <TabsContent value="video" className="h-full mt-0 overflow-hidden">
              <VideoSection module={module} />
            </TabsContent>

            {/* Content section */}
            <TabsContent value="content" className="h-full mt-0 overflow-hidden">
              <ContentSection module={module} />
            </TabsContent>

            {/* Practice section */}
            <TabsContent value="practice" className="h-full mt-0 overflow-hidden">
              <PracticeSection module={module} onNavigateToProblem={() => {}} />
            </TabsContent>

            {/* Assessment section */}
            <TabsContent value="assessment" className="h-full mt-0 overflow-hidden">
              <AssessmentSection module={module} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating Action Button for Admin Actions */}
      <Button
        className="fixed bottom-8 right-8 z-50 shadow-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
        size="icon"
        onClick={handleEditModule}
        title="Edit Module"
      >
        <Pencil className="h-6 w-6" />
      </Button>
    </div>
  );
}
