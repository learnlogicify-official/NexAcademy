import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { CourseCard, type Course } from "./course-card";

interface CoursesSectionProps {
  courses: Course[];
  sidebarCollapsed: boolean;
}

export function CoursesSection({
  courses,
  sidebarCollapsed,
}: CoursesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Courses</h2>
        <Button variant="outline" size="sm" className="gap-1">
          <BookOpen className="h-4 w-4" />
          View All
        </Button>
      </div>

      <div
        className={`grid grid-cols-1 ${
          sidebarCollapsed ? "md:grid-cols-2 xl:grid-cols-3" : "xl:grid-cols-2"
        } gap-4`}
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
