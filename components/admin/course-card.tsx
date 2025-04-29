"use client";

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  onView?: (courseId: string) => void;
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
  onView,
}: CourseCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const router = useRouter();

  // Generate a random slight offset for elements to add visual interest
  useEffect(() => {
    setRandomOffset({
      x: Math.random() * 4 - 2,
      y: Math.random() * 4 - 2
    });
  }, []);

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

  // Determine course status
  const now = new Date();
  const startDate = new Date(course.startDate);
  const endDate = new Date(course.endDate);
  const courseStatus = startDate > now 
    ? "upcoming" 
    : endDate < now 
      ? "ended" 
      : "active";

  // Get status color
  const getStatusColor = () => {
    switch (courseStatus) {
      case "upcoming": return "bg-blue-500/70";
      case "active": return "bg-green-500/70";
      case "ended": return "bg-amber-500/70";
      default: return "bg-gray-500/70";
    }
  };

  if (variant === "student") {
    return (
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className="overflow-hidden h-full border border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ 
        y: -8,
        rotateY: 2,
        rotateX: 1,
        z: 10
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300, 
        damping: 15
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full perspective-[1000px] cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card className={cn(
        "overflow-hidden h-full flex flex-col border-border/40 shadow-md",
        "transform-gpu transition-all duration-300 backdrop-blur-sm",
        "bg-gradient-to-br from-background via-background/95 to-background/90",
        isHovered ? 
          "shadow-xl border-primary/30 scale-[1.02] shadow-primary/5" : 
          "scale-100"
      )}>
        {/* Top status indicator */}
        <div className="relative">
          {/* Card accent strip based on visibility */}
          <div className={cn(
            "absolute h-1 top-0 left-0 right-0 z-10",
            course.visibility === "SHOW"
              ? "bg-gradient-to-r from-primary via-primary/90 to-primary/20" 
              : "bg-gradient-to-r from-secondary via-secondary/80 to-secondary/20"
          )} />

          {/* Course status indicator */}
          <div className="absolute top-3 left-3 z-10">
            <div className={cn(
              "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold text-white/90",
              getStatusColor()
            )}>
              {courseStatus === "upcoming" ? "Upcoming" : courseStatus === "active" ? "Active" : "Ended"}
            </div>
          </div>
        </div>

        {/* Course header with pattern background */}
        <div className="relative h-40 overflow-hidden">
          {/* Animated background pattern */}
          <motion.div 
            className={cn("absolute inset-0")}
            animate={{ 
              y: isHovered ? randomOffset.y : 0,
              x: isHovered ? randomOffset.x : 0,
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.7 }}
          >
            {pattern}
          </motion.div>

          {/* Overlay gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/95"
            animate={{ opacity: isHovered ? 0.8 : 0.9 }}
          />

          {/* Icon with animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ y: 0 }}
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
              y: isHovered ? -5 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
          >
            <Icon className="h-24 w-24 text-primary/60 drop-shadow-lg" />
          </motion.div>
          
          {/* Course visibility and info */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
            <Badge 
              variant={course.visibility === "SHOW" ? "default" : "outline"} 
              className={cn(
                "px-3 py-1 backdrop-blur-md",
                course.visibility === "SHOW" 
                  ? "bg-primary/30 hover:bg-primary/40 text-primary-foreground" 
                  : "bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground"
              )}
            >
              <div className="flex items-center">
                {course.visibility === "SHOW" ? 
                  <Eye className="h-3 w-3 mr-1.5" /> : 
                  <EyeOff className="h-3 w-3 mr-1.5" />
                }
                {course.visibility === "SHOW" ? "Visible" : "Hidden"}
              </div>
            </Badge>
          </div>
        </div>

        {/* Course content with smooth transitions */}
        <CardContent className="p-5 flex-grow backdrop-blur-sm">
          <motion.div 
            className="flex flex-col h-full"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
          >
            <div className="flex-grow space-y-3">
              {/* Course title with gradient on hover */}
              <div className="flex items-start justify-between">
                <motion.div
                  animate={{
                    background: isHovered 
                      ? "linear-gradient(to right, hsl(var(--foreground)), hsl(var(--foreground)/0.8))" 
                      : "none",
                    backgroundClip: isHovered ? "text" : "border-box",
                    WebkitBackgroundClip: isHovered ? "text" : "text",
                    WebkitTextFillColor: isHovered ? "transparent" : "initial"
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-bold leading-tight"
                >
                  {course.title}
                </motion.div>
              </div>

              {/* Course subtitle with ellipsis */}
              <CardDescription className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {course.subtitle}
              </CardDescription>
              
              {/* Course metadata in an organized, elegant layout */}
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {/* Category */}
                {course.category?.name && (
                  <div className="col-span-2 flex items-center">
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
                      {course.category.name}
                    </Badge>
                  </div>
                )}
                
                {/* Course dates */}
                <div className="inline-flex items-center text-xs text-muted-foreground truncate col-span-2">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {(() => {
                      const start = new Date(course.startDate);
                      const end = new Date(course.endDate);
                      if (start.getFullYear() === end.getFullYear()) {
                        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
                      } else {
                        return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
                      }
                    })()}
                  </span>
                </div>
                
                {/* Student count if available */}
                {course.enrolledUsers !== undefined && (
                  <div className="inline-flex items-center justify-end text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{course.enrolledUsers} student{course.enrolledUsers !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </CardContent>
        
        {/* Action buttons with glass effect & animations */}
        <CardFooter className="border-t border-border/30 p-3 pb-4 bg-background/40 backdrop-blur-md">
          <motion.div 
            className="grid w-full grid-cols-3 gap-1"
            animate={{ y: isHovered ? 0 : 3, opacity: isHovered ? 1 : 0.9 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/courses/${course.id}`)}
                className="w-full flex items-center justify-center bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary shadow-sm"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                <span className="font-medium text-xs">View</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(course)}
                className="w-full flex items-center justify-center backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                <span className="font-medium text-xs">Edit</span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full flex items-center justify-center backdrop-blur-sm border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span className="font-medium text-xs">Delete</span>
              </Button>
            </motion.div>
          </motion.div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[450px] rounded-xl bg-background/90 backdrop-blur-md border border-destructive/20">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold">Delete Course</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete the course
              "{course.title}" and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2 mt-2">
            <AlertDialogCancel className="rounded-md font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 rounded-md font-medium shadow-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 