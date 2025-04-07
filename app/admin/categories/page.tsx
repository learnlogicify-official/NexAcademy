"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search, Layout } from "lucide-react";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { CategoryCard } from "@/components/admin/category-card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description: string;
  visibility: "SHOW" | "HIDE";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your learning categories
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <Badge variant="outline" className="text-sm">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
            </Badge>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                Clear search
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {filteredCategories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Layout className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-sm">
                {searchQuery
                  ? `No categories match your search "${searchQuery}"`
                  : "Get started by creating your first category"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {paginatedCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onDelete={fetchCategories}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-4 text-sm">
                  <span className="text-muted-foreground">Page</span>
                  <span className="font-medium">{currentPage}</span>
                  <span className="text-muted-foreground">of</span>
                  <span className="font-medium">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CategoryFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
} 