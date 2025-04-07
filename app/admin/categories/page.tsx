"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { CategoryCard } from "@/components/admin/category-card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

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
      console.log("[ADMIN] Fetching categories...");
      const response = await fetch(`/api/categories?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      console.log("[ADMIN] Fetched categories:", data.categories.length);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your course categories
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
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
      ) : paginatedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-lg font-medium">
            {searchQuery
              ? `No categories found matching "${searchQuery}"`
              : "No categories found"}
          </p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or create a new category
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
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

      <CategoryFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchCategories(currentPage);
        }}
      />
    </div>
  );
} 