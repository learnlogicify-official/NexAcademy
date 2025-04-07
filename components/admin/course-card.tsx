"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Code, 
  FileCode, 
  FileType, 
  Users, 
  Star,
  GraduationCap,
  Binary,
  Atom,
  Brain,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditCourseModal } from "./edit-course-modal";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface CourseCardProps {
  course: {
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
  };
  variant?: "admin" | "student";
  onEdit?: () => void;
  onDelete?: () => void;
  onContinue?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const getCourseIcon = (title: string) => {
  if (title.toLowerCase().includes("javascript")) {
    return Code;
  }
  if (title.toLowerCase().includes("react")) {
    return FileCode;
  }
  if (title.toLowerCase().includes("python")) {
    return FileType;
  }
  return BookOpen;
};

const getBackgroundIcon = (title: string) => {
  if (title.toLowerCase().includes("javascript")) {
    return Binary;
  }
  if (title.toLowerCase().includes("react")) {
    return Atom;
  }
  if (title.toLowerCase().includes("python")) {
    return Brain;
  }
  return GraduationCap;
};

const getPatternStyle = (title: string) => {
  const baseClass = "absolute pointer-events-none select-none";
  
  // Define all possible patterns
  const patterns = [
    // Pattern 1: Curly Braces with Icon
    <>
      <div className={`${baseClass} right-0 top-0 opacity-[0.02] font-mono text-4xl`}>{"{ "}</div>
      <div className={`${baseClass} right-4 bottom-0 opacity-[0.02] font-mono text-4xl`}>{" }"}</div>
      <div className={`${baseClass} right-8 top-12 opacity-[0.02]`}>
        {(() => {
          const IconComponent = getBackgroundIcon(title);
          return <IconComponent className="w-28 h-28" strokeWidth={0.3} />;
        })()}
      </div>
    </>,
    
    // Pattern 2: Dots Grid
    <>
      <div 
        className={`${baseClass} inset-0 opacity-[0.02]`} 
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
    </>,
    
    // Pattern 3: Code Lines
    <>
      <div className={`${baseClass} right-8 top-8 opacity-[0.02] font-mono text-xs whitespace-pre leading-4`}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i}>{`const pattern${i} = () => {`}</div>
        ))}
      </div>
    </>,
    
    // Pattern 4: Scattered Icons
    <>
      {Array(5).fill(0).map((_, i) => (
        <div 
          key={i} 
          className={`${baseClass} opacity-[0.015]`}
          style={{
            right: `${20 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 40}%`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          <Code className="w-6 h-6" strokeWidth={0.3} />
        </div>
      ))}
    </>,
    
    // Pattern 5: Binary Rain
    <>
      <div className={`${baseClass} right-4 top-4 opacity-[0.02] font-mono text-xs`}>
        {Array(8).fill(0).map((_, i) => (
          <div key={i}>{Array(6).fill(0).map(() => Math.round(Math.random())).join('')}</div>
        ))}
      </div>
    </>,
    
    // Pattern 6: Circuit Board
    <>
      <div 
        className={`${baseClass} right-0 bottom-0 w-64 h-64 opacity-[0.02]`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='0.3' d='M4 4h8v8H4zm16 0h8v8h-8zM4 20h8v8H4zm16 0h8v8h-8z'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px'
        }}
      />
    </>,
    
    // Pattern 7: Diagonal Grid
    <>
      <div 
        className={`${baseClass} inset-0 opacity-[0.015]`}
        style={{
          backgroundImage: `
            linear-gradient(45deg, currentColor 1px, transparent 1px),
            linear-gradient(-45deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
    </>,
    
    // Pattern 8: Floating Particles
    <>
      {Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} w-1 h-1 rounded-full bg-current opacity-[0.02]`}
          style={{
            right: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`
          }}
        />
      ))}
    </>,
    
    // Pattern 9: Hexagonal Grid
    <>
      <div 
        className={`${baseClass} right-0 bottom-0 w-64 h-64 opacity-[0.02]`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='0.3' d='M12 2l9 5v10l-9 5-9-5V7z'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />
    </>,
    
    // Pattern 10: Stacked Brackets
    <>
      <div className={`${baseClass} right-4 top-4 opacity-[0.02] font-mono`}>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="text-right">
            {'{ '.repeat(i + 1)}
            <br />
            {' }'.repeat(i + 1)}
          </div>
        ))}
      </div>
    </>,
    
    // Pattern 11: Mesh Grid
    <>
      <div 
        className={`${baseClass} inset-0 opacity-[0.015]`}
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
    </>,
    
    // Pattern 12: Wave Lines
    <>
      <div 
        className={`${baseClass} right-0 bottom-0 w-full h-64 opacity-[0.02]`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='0.3' d='M0 10s25-10 50 0 50 0 50 0'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 20px'
        }}
      />
    </>,
    
    // Pattern 13: Crossed Lines
    <>
      <div 
        className={`${baseClass} inset-0 opacity-[0.015]`}
        style={{
          backgroundImage: `
            linear-gradient(0deg, currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </>,
    
    // Pattern 14: Random Dots
    <>
      {Array(15).fill(0).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} w-1.5 h-1.5 rounded-full bg-current opacity-[0.02]`}
          style={{
            right: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            transform: `scale(${0.5 + Math.random()})`
          }}
        />
      ))}
    </>,
    
    // Pattern 15: Code Blocks
    <>
      <div className={`${baseClass} right-4 top-4 opacity-[0.02] font-mono text-xs`}>
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="mb-2">
            {`function pattern${i}() {`}
            <br />
            {'  return (...);'}
            <br />
            {'}'}
          </div>
        ))}
      </div>
    </>
  ];

  // Randomly select a pattern
  const randomIndex = Math.floor(Math.random() * patterns.length);
  return patterns[randomIndex];
};

export function CourseCard({ course, variant = "admin", onEdit, onDelete, onContinue, onVisibilityChange }: CourseCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const { toast } = useToast();

  const Icon = getCourseIcon(course.title);
  const pattern = getPatternStyle(course.title);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      onDelete?.();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: boolean) => {
    try {
      setIsUpdatingVisibility(true);
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: newVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to update course visibility");
      }

      onVisibilityChange?.(newVisibility);
      toast({
        title: "Success",
        description: `Course is now ${newVisibility ? "visible" : "hidden"}`,
      });
    } catch (error) {
      console.error("Error updating course visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update course visibility",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  if (variant === "student") {
    return (
      <Card className="group relative overflow-hidden bg-gradient-to-br from-background via-card to-muted hover:shadow-xl transition-all duration-300 border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <CardContent className="relative p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative p-3 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 relative z-10"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive relative z-10"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </div>
                {course.subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {course.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary border-0 font-medium">
                  {course.category.name}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                    <Users className="h-4 w-4" />
                    <span>125 enrolled</span>
                  </div>
                  {!course.isVisible && (
                    <Badge variant="secondary" className="text-xs">Hidden</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {course.progress || 0}% Complete
                  </span>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-muted/30 to-muted/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              onClick={onContinue}
            >
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="group relative overflow-hidden border-0 h-[240px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-h-[60px]">
                <CardTitle className="text-lg font-semibold line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 text-muted-foreground/80">{course.subtitle}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 relative z-10"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive relative z-10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                {course.category.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs flex items-center gap-1.5 h-6",
                  course.isVisible 
                    ? "bg-green-50 text-green-700 hover:bg-green-100" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                )}
                onClick={() => handleVisibilityChange(!course.isVisible)}
                disabled={isUpdatingVisibility}
              >
                {isUpdatingVisibility ? (
                  "Updating..."
                ) : course.isVisible ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Draft</span>
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Start Date</span>
                </div>
                <p className="font-medium">
                  {format(new Date(course.startDate), "MMM d, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>End Date</span>
                </div>
                <p className="font-medium">
                  {format(new Date(course.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>125 students enrolled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditCourseModal
        course={course}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={onEdit}
        onLoadingChange={() => {}}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 