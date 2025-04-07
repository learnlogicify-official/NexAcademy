"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModuleList } from "@/components/admin/module-list";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  isVisible: boolean;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  order: number;
  submodules: Submodule[];
}

interface Submodule {
  id: string;
  title: string;
  order: number;
  moduleId: string;
}

export default function CourseShowPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">{course.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            Edit Course
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />

      <ModuleList
        modules={course.modules}
        onModuleUpdate={fetchCourse}
        onSubmoduleUpdate={fetchCourse}
      />

      <CourseFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={fetchCourse}
        course={course}
      />
    </div>
  );
} 