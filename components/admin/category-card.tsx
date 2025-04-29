"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, Folder, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditCategoryModal } from "./edit-category-modal";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    visibility: "SHOW" | "HIDE";
  };
  onDelete: () => void;
  onEdit?: () => void;
  onVisibilityChange?: () => void;
}

export function CategoryCard({ category, onDelete, onEdit, onVisibilityChange }: CategoryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400 && error.error === "Cannot delete category with associated courses") {
          toast({
            title: "Cannot Delete Category",
            description: "This category has associated courses. Please remove or reassign the courses before deleting the category.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to delete category");
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-border/40 bg-gradient-to-br from-background to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className={cn(
          "absolute top-0 left-0 h-1 w-full",
          category.visibility === "SHOW" 
            ? "bg-gradient-to-r from-primary to-primary/60" 
            : "bg-gradient-to-r from-secondary to-secondary/60"
        )} />
        
        <CardHeader className="flex flex-col space-y-4 pb-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-4 min-w-0">
              <motion.div 
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md",
                  category.visibility === "SHOW" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary/10 text-secondary"
                )}
                whileHover={{ rotate: [0, -10, 0], transition: { duration: 0.5 } }}
              >
                <Folder className="h-6 w-6" />
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg font-semibold truncate">
                  {category.name}
                </CardTitle>
                {category.description && (
                  <div
                    className="text-sm text-muted-foreground line-clamp-2 mt-2 prose-sm prose-p:my-1"
                    dangerouslySetInnerHTML={{ __html: category.description }}
                  />
                )}
              </div>
            </div>
            
            <Badge
              variant={category.visibility === "SHOW" ? "default" : "secondary"}
              className={cn(
                "shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-all duration-300",
                category.visibility === "SHOW" 
                  ? "bg-primary/15 text-primary hover:bg-primary/20" 
                  : "bg-secondary/15 text-secondary hover:bg-secondary/20"
              )}
            >
              {category.visibility === "SHOW" ? (
                <Eye className="h-3 w-3 mr-1.5" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1.5" />
              )}
              <span>{category.visibility === "SHOW" ? "Visible" : "Hidden"}</span>
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 pt-3 relative z-10">
            <motion.div 
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className={cn(
                  "w-full rounded-md h-10 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm",
                  "hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                )}
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-medium">Editing...</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    <span className="font-medium">Edit</span>
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className={cn(
                  "w-full rounded-md h-10 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm",
                  "hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                )}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-medium">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">Delete</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardHeader>
      </Card>

      <EditCategoryModal
        category={category}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onDelete}
        onLoadingChange={setIsEditing}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[450px] rounded-xl">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete "{category.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2 mt-2">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="rounded-md font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-md font-medium shadow-sm"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 