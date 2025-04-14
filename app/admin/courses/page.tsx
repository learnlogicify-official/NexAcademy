"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { CourseCard } from "@/components/admin/course-card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseFormModal } from "@/components/admin/course-form-modal";
import { useCategories } from "@/hooks/use-categories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  enrolledUsers?: number;
  visibility: "SHOW" | "HIDE";
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  instructor?: {
    name: string;
    image?: string;
  };
  thumbnail?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const { toast } = useToast();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const itemsPerPage = 9;

  useEffect(() => {
    fetchCategories();
    fetchCourses(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchCourses(1);
  }, [searchQuery, selectedCategory, selectedVisibility]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchCourses = async (page: number) => {
    try {
      setIsPageLoading(true);
      console.log("[ADMIN] Fetching courses...");
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        category: selectedCategory,
        visibility: selectedVisibility,
      });

      console.log("[ADMIN] Fetching with params:", params.toString());
      const response = await fetch(`/api/courses?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch courses");
      }

      const data = await response.json();
      console.log("[ADMIN] Fetched courses:", data.courses.length);
      setCourses(data.courses);
      setTotalPages(data.pagination.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("[ADMIN] Error in fetchCourses:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch courses",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const paginatedCourses = courses;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleDelete = () => {
    fetchCourses(currentPage);
  };

  const handleEdit = () => {
    fetchCourses(currentPage);
  };

  const handleVisibilityChange = () => {
    fetchCourses(currentPage);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete course");
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      fetchCourses(currentPage);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleToggleVisibility = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const newVisibility = course.visibility === "SHOW" ? "HIDE" : "SHOW";
      
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...course,
          visibility: newVisibility,
          startDate: new Date(course.startDate).toISOString(),
          endDate: new Date(course.endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course visibility");
      }

      toast({
        title: "Success",
        description: `Course is now ${newVisibility === "SHOW" ? "visible" : "hidden"}`,
      });

      fetchCourses(currentPage);
    } catch (error) {
      console.error("Error updating course visibility:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course visibility",
        variant: "destructive",
      });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          disabled={isPageLoading}
          className={i === currentPage ? "bg-primary text-primary-foreground" : ""}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  const handleSuccess = async () => {
    try {
      setIsLoading(true);
      await fetchCourses(currentPage);
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error in handleSuccess:", error);
      toast({
        title: "Error",
        description: "Failed to refresh courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCoursesByStatus = (courses: Course[]) => {
    const now = new Date();
    return courses.filter(course => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      switch (activeTab) {
        case "in-progress":
          return startDate <= now && endDate >= now;
        case "future":
          return startDate > now;
        case "past":
          return endDate < now;
        default:
          return true;
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Courses</h1>
          <Button onClick={handleCreateCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesData?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedVisibility}
                onValueChange={setSelectedVisibility}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SHOW">Visible</SelectItem>
                  <SelectItem value="HIDE">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="future">Future Courses</TabsTrigger>
            <TabsTrigger value="past">Past Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filterCoursesByStatus(courses).length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No courses found
                </div>
              ) : (
                filterCoursesByStatus(courses).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={handleDeleteCourse}
                    onEdit={handleEditCourse}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filterCoursesByStatus(courses).length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No in-progress courses found
                </div>
              ) : (
                filterCoursesByStatus(courses).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={handleDeleteCourse}
                    onEdit={handleEditCourse}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="future" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filterCoursesByStatus(courses).length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No future courses found
                </div>
              ) : (
                filterCoursesByStatus(courses).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={handleDeleteCourse}
                    onEdit={handleEditCourse}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filterCoursesByStatus(courses).length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground">
                  No past courses found
                </div>
              ) : (
                filterCoursesByStatus(courses).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onDelete={handleDeleteCourse}
                    onEdit={handleEditCourse}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPageLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {renderPageNumbers()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPageLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CourseFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleModalClose();
          }
        }}
        onSuccess={handleSuccess}
        course={selectedCourse ? {
          id: selectedCourse.id,
          title: selectedCourse.title,
          subtitle: selectedCourse.subtitle,
          description: selectedCourse.description,
          startDate: selectedCourse.startDate,
          endDate: selectedCourse.endDate,
          categoryId: selectedCourse.categoryId,
          visibility: selectedCourse.visibility
        } : undefined}
      />
    </div>
  );
} 