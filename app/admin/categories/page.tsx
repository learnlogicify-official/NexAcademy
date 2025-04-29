"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search, Eye, EyeOff, Folder } from "lucide-react";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { CategoryCard } from "@/components/admin/category-card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description: string;
  visibility: "SHOW" | "HIDE";
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | "SHOW" | "HIDE">("ALL");
  const router = useRouter();
  const { toast } = useToast();

  const itemsPerPage = 9;

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchCategories(1);
  }, [searchQuery]);

  const fetchCategories = async (page: number) => {
    try {
      setIsPageLoading(true);
      const response = await fetch(`/api/categories?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories);
      setTotalPages(data.pagination.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("[ADMIN] Error in fetchCategories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
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

  const paginatedCategories = categories;
  const filteredCategories = visibilityFilter === "ALL"
    ? paginatedCategories
    : paginatedCategories.filter(cat => cat.visibility === visibilityFilter);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleDelete = () => {
    fetchCategories(currentPage);
  };

  const handleEdit = () => {
    fetchCategories(currentPage);
  };

  const handleVisibilityChange = () => {
    fetchCategories(currentPage);
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 px-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Categories</h1>
          <p className="text-muted-foreground">Manage your course categories</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="bg-accent/50 p-1 rounded-full flex shadow-sm">
            <Button
              variant={visibilityFilter === "ALL" ? "default" : "outline"}
              onClick={() => setVisibilityFilter("ALL")}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-200",
                visibilityFilter === "ALL" ? "shadow-sm" : "bg-transparent"
              )}
            >
              All
            </Button>
            <Button
              variant={visibilityFilter === "SHOW" ? "default" : "outline"}
              onClick={() => setVisibilityFilter("SHOW")}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-200",
                visibilityFilter === "SHOW" ? "shadow-sm" : "bg-transparent"
              )}
            >
              <Eye className="h-4 w-4 mr-1" /> Visible
            </Button>
            <Button
              variant={visibilityFilter === "HIDE" ? "default" : "outline"}
              onClick={() => setVisibilityFilter("HIDE")}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-200",
                visibilityFilter === "HIDE" ? "shadow-sm" : "bg-transparent"
              )}
            >
              <EyeOff className="h-4 w-4 mr-1" /> Hidden
            </Button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="ml-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Modern Search */}
      <motion.div 
        className="mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 rounded-full shadow-md border-accent focus-visible:ring-primary h-12"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary absolute top-0 left-0"></div>
          </div>
        </motion.div>
      ) : filteredCategories.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-primary/5 p-6 rounded-full mb-6">
            <Folder className="h-16 w-16 text-primary/60" />
          </div>
          <p className="text-xl font-medium mb-2">
            {searchQuery
              ? `No categories found matching "${searchQuery}"`
              : "No categories found"}
          </p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground max-w-sm">
              Try adjusting your search or create a new category
            </p>
          )}
          {!searchQuery && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Category
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onVisibilityChange={handleVisibilityChange}
                />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <motion.div 
              className="flex justify-center items-center gap-2 mt-10 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
        </>
      )}

      <CategoryFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchCategories(currentPage);
        }}
      />
    </motion.div>
  );
} 