"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CourseFormModal } from "@/components/admin/course-form-modal";
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

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  isVisible: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const router = useRouter();
  const { toast } = useToast();

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

      const response = await fetch(`/api/courses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
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
        description: "Failed to fetch courses",
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
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
                {categories.map((category) => (
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
                <SelectItem value="true">Visible</SelectItem>
                <SelectItem value="false">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : paginatedCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-lg font-medium">
            {searchQuery || selectedCategory || selectedVisibility
              ? "No courses found matching your filters"
              : "No courses found"}
          </p>
          {(searchQuery || selectedCategory || selectedVisibility) && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or create a new course
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onVisibilityChange={handleVisibilityChange}
                variant="admin"
              />
            ))}
          </div>

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
        </>
      )}

      <CourseFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchCourses(currentPage);
        }}
      />
    </div>
  );
} 