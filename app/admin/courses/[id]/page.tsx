"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Users, Clock, CheckCircle2, Timer, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { ModuleList } from "@/components/admin/module-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  visibility: "SHOW" | "HIDE";
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  enrolledCount?: number;
  completedCount?: number;
  inProgressCount?: number;
  thumbnail?: string;
  modules: {
    id: string;
    title: string;
    order: number;
    courseId: string;
    submodules: {
      id: string;
      title: string;
      order: number;
      moduleId: string;
    }[];
  }[];
}

export default function CourseViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch course");
      }
      const data = await response.json();
      setCourse({
        ...data,
        enrolledCount: 466, // Example data, replace with actual API data
        completedCount: 0,
        inProgressCount: 125,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [params.id, toast]);

  const getPatternStyle = (title: string) => {
    const patterns = {
      dots: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px) 0 0/20px 20px",
      grid: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px) 0 0/20px 20px, linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px) 0 0/20px 20px",
      diagonal: "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%) 0 0/20px 20px",
      circles: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0, rgba(255,255,255,0) 60%) 0 0/40px 40px",
    };

    // Use a simple hash of the title to select a pattern
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const patternKeys = Object.keys(patterns) as (keyof typeof patterns)[];
    const pattern = patterns[patternKeys[hash % patternKeys.length]];

    return pattern;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/courses")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const yetToStartCount = (course.enrolledCount || 0) - ((course.completedCount || 0) + (course.inProgressCount || 0));
  const progressPercentage = ((course.completedCount || 0) + (course.inProgressCount || 0)) / (course.enrolledCount || 1) * 100;

  return (
    <div>
      <div className="relative h-[200px] bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden mb-8">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: getPatternStyle(course.title),
            opacity: 0.5 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="container mx-auto h-full relative">
          <div className="flex items-center justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/courses")}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-background/50 backdrop-blur-sm"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground mt-2">{course.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={course.visibility === "SHOW" ? "default" : "secondary"}>
                  {course.visibility === "SHOW" ? "Visible" : "Hidden"}
                </Badge>
                <Badge variant="secondary">{course.category?.name}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Enrolled Students</h3>
                  </div>
                  <span className="text-2xl font-bold">{course.enrolledCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Completed</h3>
                  </div>
                  <span className="text-2xl font-bold">{course.completedCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">In Progress</h3>
                  </div>
                  <span className="text-2xl font-bold">{course.inProgressCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Yet to Start</h3>
                  </div>
                  <span className="text-2xl font-bold">{yetToStartCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="course" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="course">Course</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="question-bank">Question Bank</TabsTrigger>
            </TabsList>

            <TabsContent value="course">
              <ModuleList
                courseId={course.id}
                modules={course.modules || []}
                onModuleUpdate={fetchCourse}
              />
            </TabsContent>

            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle>Course Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add participant list component here */}
                  <div className="text-muted-foreground">Participant list will be displayed here</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Course Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add reports component here */}
                  <div className="text-muted-foreground">Course reports and analytics will be displayed here</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="question-bank">
              <Card>
                <CardHeader>
                  <CardTitle>Question Bank</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add question bank component here */}
                  <div className="text-muted-foreground">Course questions and assessments will be displayed here</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <CourseFormModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSuccess={fetchCourse}
            course={course}
          />
        </div>
      </div>
    </div>
  );
} 