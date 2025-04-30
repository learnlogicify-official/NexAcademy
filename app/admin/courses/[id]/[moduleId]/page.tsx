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
import { BookOpen, ClipboardCheck, Code, FileText, Video, Pencil, Info, Edit, Eye, Clock, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function LessonPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const resolvedParams = use(params) as { id: string; moduleId: string };
  const { id, moduleId } = resolvedParams;
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("intro");
  const [module, setModule] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [videoCount, setVideoCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);

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

  useEffect(() => {
    async function fetchCounts() {
      if (!moduleId) return;
      try {
        const [videosRes, articlesRes, assessmentsRes] = await Promise.all([
          fetch(`/api/modules/${moduleId}/videos`),
          fetch(`/api/modules/${moduleId}/articles`),
          fetch(`/api/modules/${moduleId}/assessments`),
        ]);
        const videos = await videosRes.json();
        const articles = await articlesRes.json();
        const assessments = await assessmentsRes.json();
        setVideoCount(Array.isArray(videos) ? videos.length : 0);
        setLessonCount(Array.isArray(articles) ? articles.length : 0);
        setPracticeCount(Array.isArray(assessments) ? assessments.length : 0);
        setAssessmentCount(Array.isArray(assessments) ? assessments.length : 0);
      } catch (e) {
        setVideoCount(0);
        setLessonCount(0);
        setPracticeCount(0);
        setAssessmentCount(0);
      }
    }
    fetchCounts();
  }, [moduleId]);

  if (loading || !module) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-black/5 p-6">
        <div className="animate-pulse flex items-center gap-3 mb-6">
          <Skeleton className="h-12 w-12 rounded-full bg-gray-800/50" />
          <div>
            <Skeleton className="h-5 w-32 mb-2 bg-gray-800/50" />
            <Skeleton className="h-4 w-48 bg-gray-800/30" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl mb-6 bg-gray-800/50" />
        <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-full mb-6 bg-gray-800/30" />
        <Skeleton className="flex-1 w-full rounded-xl bg-gray-800/20" />
      </div>
    );
  }

  // Floating action button for admin actions
  const handleEditModule = () => router.push(`/admin/courses/${id}/${moduleId}/edit`);

  // Calculate module progress based on video count and lesson count
  const totalItems = videoCount + lessonCount + assessmentCount;
  const completedItems = Math.floor(Math.random() * totalItems); // Placeholder for actual completion tracking
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 p-0">
      {/* Hero section with module details */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-violet-900/90 via-indigo-800/70 to-blue-900/90 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative z-10">
          {/* Navigation */}
          <div className="flex items-center gap-3 text-white/80 mb-10">
            <Button variant="ghost" size="icon" asChild className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md">
              <Link href={`/admin/courses/${module?.course?.id || id}`}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Course</span>
              </Link>
            </Button>
            <nav className="flex items-center text-sm gap-1 backdrop-blur-sm bg-black/20 rounded-full px-4 py-2">
              <Link href="/admin/courses" className="hover:text-white transition-colors font-medium">Courses</Link>
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0 opacity-40" />
              {course ? (
                <Link href={`/admin/courses/${course.id}`} className="hover:text-white transition-colors font-medium">{course.title}</Link>
              ) : (
                <span className="text-white/60">Course</span>
              )}
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0 opacity-40" />
              <span className="text-white font-bold truncate max-w-[120px] sm:max-w-[300px]">{module.title}</span>
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-white/10 hover:bg-white/20 border-0 text-xs backdrop-blur-md">
                Module {module.order}
              </Badge>
              {module.course?.level && (
                <Badge variant="secondary" className="bg-blue-500/80 text-white border-0 text-xs">
                  {module.course.level}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Module header */}
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10 mb-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 transform rotate-3 shadow-[0_0_25px_rgba(79,70,229,0.5)]">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight"
              >
                {module.title}
              </motion.h1>
              <p className="text-white/70 text-lg max-w-3xl">
                {module.description || "No description available"}
              </p>
              
              {/* Progress bar */}
              <div className="mt-6 mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80 font-medium">Module progress</span>
                  <span className="text-white/80 font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:self-start">
              <Button
                variant="outline" 
                size="sm"
                className="gap-1 text-sm text-white bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md"
                title="View module"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 border-0 hover:opacity-90"
                onClick={handleEditModule}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-8 z-20 relative">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Video count stat */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-white/10 shadow-lg overflow-hidden group hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all duration-300">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-700/30 rounded-lg p-3 group-hover:bg-indigo-600/40 transition-colors duration-300">
                  <Video className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{videoCount}</div>
                  <div className="text-white/60 text-sm">Videos</div>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
          </div>

          {/* Lesson count stat */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-white/10 shadow-lg overflow-hidden group hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all duration-300">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-blue-700/30 rounded-lg p-3 group-hover:bg-blue-600/40 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{lessonCount}</div>
                  <div className="text-white/60 text-sm">Lessons</div>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
          </div>

          {/* Practice count stat */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-white/10 shadow-lg overflow-hidden group hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all duration-300">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-700/30 rounded-lg p-3 group-hover:bg-cyan-600/40 transition-colors duration-300">
                  <Code className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{practiceCount}</div>
                  <div className="text-white/60 text-sm">Practice Items</div>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-cyan-600 to-cyan-400"></div>
          </div>

          {/* Assessment count stat */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-white/10 shadow-lg overflow-hidden group hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] transition-all duration-300">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-purple-700/30 rounded-lg p-3 group-hover:bg-purple-600/40 transition-colors duration-300">
                  <ClipboardCheck className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{assessmentCount}</div>
                  <div className="text-white/60 text-sm">Assessments</div>
                </div>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
          </div>
        </motion.div>
      </div>

      {/* Main content with tabs */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <Tabs 
            value={activeSection} 
            onValueChange={setActiveSection}
            className="flex flex-col min-h-[600px]"
          >
            <div className="bg-gradient-to-r from-black/70 to-zinc-900/70 border-b border-white/10">
              <TabsList className="h-16 bg-transparent w-full justify-start gap-2 px-4 flex-wrap">
                <TabsTrigger 
                  value="intro" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-black/20 data-[state=inactive]:text-white/70 rounded-lg px-4 py-2.5 h-10 transition-all duration-200"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-black/20 data-[state=inactive]:text-white/70 rounded-lg px-4 py-2.5 h-10 transition-all duration-200"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Videos
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-black/20 data-[state=inactive]:text-white/70 rounded-lg px-4 py-2.5 h-10 transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lessons
                </TabsTrigger>
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-black/20 data-[state=inactive]:text-white/70 rounded-lg px-4 py-2.5 h-10 transition-all duration-200"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Practice
                </TabsTrigger>
                <TabsTrigger 
                  value="assessment" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-0 data-[state=inactive]:bg-black/20 data-[state=inactive]:text-white/70 rounded-lg px-4 py-2.5 h-10 transition-all duration-200"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Assessment
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900/90 to-black/90">
              <TabsContent value="intro" className="p-0 m-0 h-full data-[state=active]:flex">
                <ChapterIntroSection 
                  module={module}
                  videoCount={videoCount}
                  videoCompleted={0}
                  lessonCount={lessonCount}
                  lessonCompleted={0}
                  practiceCount={practiceCount}
                  practiceCompleted={0}
                  assessmentCount={assessmentCount}
                  assessmentCompleted={0}
                />
              </TabsContent>

              <TabsContent value="video" className="p-0 m-0 h-full data-[state=active]:flex">
                <VideoSection module={module} />
              </TabsContent>

              <TabsContent value="content" className="p-0 m-0 h-full data-[state=active]:flex">
                <ContentSection module={module} />
              </TabsContent>

              <TabsContent value="practice" className="p-0 m-0 h-full data-[state=active]:flex">
                <PracticeSection module={module} isAdmin={true} />
              </TabsContent>

              <TabsContent value="assessment" className="p-0 m-0 h-full data-[state=active]:flex">
                <AssessmentSection module={module} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>

      {/* Floating Action Button for Admin Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          className="relative rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] group overflow-hidden border-0"
          size="lg"
          onClick={handleEditModule}
          title="Edit Module"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <Pencil className="h-5 w-5 z-10 relative" />
          <span className="ml-2 z-10 relative">Edit Module</span>
        </Button>
      </motion.div>
    </div>
  );
}
 