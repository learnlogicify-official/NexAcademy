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
  BarChart2,
  Pencil
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourseCardProps {
  course: {
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
  };
  variant?: "admin" | "student";
  onEdit?: (course: CourseCardProps["course"]) => void;
  onDelete?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  onToggleVisibility?: (courseId: string, visibility: "SHOW" | "HIDE") => void;
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

const getDefaultThumbnail = (title: string): string | undefined => {
  const lowerTitle = title.toLowerCase();
  
  // Use more reliable image URLs
  if (lowerTitle.includes('javascript')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png';
  }
  if (lowerTitle.includes('react')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png';
  }
  if (lowerTitle.includes('python')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/python/python.png';
  }
  if (lowerTitle.includes('web')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/html/html.png';
  }
  if (lowerTitle.includes('mobile')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/android/android.png';
  }
  if (lowerTitle.includes('data')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/sql/sql.png';
  }
  if (lowerTitle.includes('cloud')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/aws/aws.png';
  }
  if (lowerTitle.includes('ai') || lowerTitle.includes('machine learning')) {
    return 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/tensorflow/tensorflow.png';
  }
  
  return undefined;
};

export function CourseCard({
  course,
  variant = "admin",
  onEdit,
  onDelete,
  onContinue,
  onToggleVisibility,
}: CourseCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(course.id);
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting course:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete course",
          variant: "destructive",
        });
      }
    }
  };

  const Icon = getCourseIcon(course.title);
  const pattern = getPatternStyle(course.title);

  if (variant === "student") {
    return (
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <div className={cn("absolute inset-0", pattern)} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-16 w-16 text-primary" />
          </div>
        </div>
        <CardContent className="p-6">
          <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
          <CardDescription className="mt-2">{course.subtitle}</CardDescription>
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary">{course.category?.name}</Badge>
            <Button variant="ghost" size="sm" onClick={() => onContinue?.(course.id)}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <div className={cn("absolute inset-0", pattern)} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-16 w-16 text-primary" />
        </div>
      </div>
      <CardContent className="p-6">
        <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
        <CardDescription className="mt-2">{course.subtitle}</CardDescription>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary">{course.category?.name}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility?.(course.id, course.visibility === "SHOW" ? "HIDE" : "SHOW")}
          >
            {course.visibility === "SHOW" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(course)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>

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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 