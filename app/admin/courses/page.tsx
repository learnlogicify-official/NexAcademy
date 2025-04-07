"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard } from "@/components/admin/course-card";
import { AddCourseModal } from "@/components/admin/add-course-modal";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  progress?: number;
  isVisible?: boolean;
  category: {
    id: string;
    name: string;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const itemsPerPage = 9;

  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCourses = async (page: number) => {
    try {
      console.log("[ADMIN] Fetching courses...");
      const response = await fetch(`/api/courses?page=${page}&limit=9`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[ADMIN] Failed to fetch courses:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      console.log("[ADMIN] Fetched courses:", data.courses.length);
      setCourses(data.courses);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("[ADMIN] Error in fetchCourses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchCourses(newPage);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    // TODO: Implement search API endpoint
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    fetchCourses(currentPage);
  };

  const handleEdit = () => {
    fetchCourses(currentPage);
  };

  const handleVisibilityChange = () => {
    fetchCourses(currentPage);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search"
              : "Create your first course"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                variant="admin"
                onDelete={handleDelete}
                onEdit={handleEdit}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <AddCourseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchCourses(currentPage);
        }}
      />
    </div>
  );
} 