"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search, Loader2, Filter, Calendar, SortAsc, SortDesc, LayoutGrid, Eye, EyeOff, BookOpen, Clock, CalendarCheck, CalendarX, CheckCircle2, X, ArrowUpDown, ArrowRightLeft } from "lucide-react";
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
import { motion } from "framer-motion";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "in-progress" | "future" | "past">("all");
  const [sortField, setSortField] = useState<"title" | "startDate" | "enrolledUsers">("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        category: selectedCategory,
        visibility: selectedVisibility,
      });

      const response = await fetch(`/api/courses?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch courses");
      }

      const data = await response.json();
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

      switch (statusFilter) {
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

  const sortCourses = (courses: Course[]) => {
    return [...courses].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "startDate") {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortField === "enrolledUsers") {
        comparison = (a.enrolledUsers || 0) - (b.enrolledUsers || 0);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const filteredAndSortedCourses = sortCourses(filterCoursesByStatus(paginatedCourses));

  const getCourseStatusCount = (status: "in-progress" | "future" | "past" | "all") => {
    const now = new Date();
    if (status === "all") return paginatedCourses.length;
    
    return paginatedCourses.filter(course => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);

      switch (status) {
        case "in-progress":
          return startDate <= now && endDate >= now;
        case "future":
          return startDate > now;
        case "past":
          return endDate < now;
        default:
          return true;
      }
    }).length;
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const getStatusIcon = (status: "all" | "in-progress" | "future" | "past") => {
    switch (status) {
      case "all": return LayoutGrid;
      case "in-progress": return Clock;
      case "future": return CalendarCheck;
      case "past": return CalendarX;
    }
  };

  return (
    <div>
      <motion.div 
        className="container mx-auto space-y-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Modern header with gradient and create button */}
        <div className="relative py-8 px-4 mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Courses</h1>
              <p className="text-muted-foreground mt-1">Manage your educational courses and control their visibility</p>
            </div>
            <div className="flex gap-2">
              
              <Button 
                onClick={handleCreateCourse} 
                size="lg"
                className="bg-primary/90 hover:bg-primary shadow-md"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Course
              </Button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 opacity-10">
            <BookOpen className="w-full h-full" strokeWidth={0.5} />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-border/50 p-5 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses by title, description or instructor..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 h-11 rounded-md"
              />
            </div>
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="h-11"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(selectedCategory !== "all" || selectedVisibility !== "all") && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-5 h-5 flex items-center justify-center">
                    {(selectedCategory !== "all" ? 1 : 0) + (selectedVisibility !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              <div className="h-11 flex items-stretch">
                <Select
                  value={sortField}
                  onValueChange={(value: "title" | "startDate" | "enrolledUsers") => setSortField(value)}
                >
                  <SelectTrigger className="w-[150px] h-full border-r-0 rounded-r-none">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="startDate">Date</SelectItem>
                    <SelectItem value="enrolledUsers">Enrollment</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleSortDirection}
                  className="h-full rounded-l-none"
                >
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Additional filters (expandable) */}
          {isFilterExpanded && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-border/40"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Category</p>
                <Select
                  value={selectedCategory}
                  onValueChange={(value: string) => setSelectedCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
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
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Visibility</p>
                <Select
                  value={selectedVisibility}
                  onValueChange={(value: string) => setSelectedVisibility(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="SHOW">
                      <div className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Visible
                      </div>
                    </SelectItem>
                    <SelectItem value="HIDE">
                      <div className="flex items-center">
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hidden
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Date Range</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsFilterExpanded(false)} className="ml-auto">
                    <X className="h-4 w-4 mr-1" /> Close Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Status Filters (Pill Buttons) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "in-progress", "future", "past"] as const).map((status) => {
            const StatusIcon = getStatusIcon(status);
            const count = getCourseStatusCount(status);
            return (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 ${statusFilter === status ? "bg-primary" : ""}`}
                disabled={count === 0}
              >
                <StatusIcon className="mr-2 h-4 w-4" />
                {status === "all" ? "All Courses" : 
                 status === "in-progress" ? "In Progress" : 
                 status === "future" ? "Upcoming" : "Past"}
                <Badge variant={statusFilter === status ? "secondary" : "outline"} className="ml-2">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex flex-col gap-4 items-center justify-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary/70" />
            <p className="text-muted-foreground animate-pulse">Loading courses...</p>
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/5 p-8 rounded-full mb-6">
              <BookOpen className="h-16 w-16 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery 
                ? "No courses match your search criteria. Try adjusting your filters or search terms."
                : "You haven't created any courses yet. Start by creating your first course!"}
            </p>
            <Button 
              onClick={handleCreateCourse} 
              className="px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Course
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAndSortedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <CourseCard
                  course={course}
                  onDelete={handleDeleteCourse}
                  onEdit={handleEditCourse}
                  onToggleVisibility={handleToggleVisibility}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center items-center gap-2 mt-8 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-accent/50 p-1 rounded-full flex shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPageLoading}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {renderPageNumbers()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPageLoading}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

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