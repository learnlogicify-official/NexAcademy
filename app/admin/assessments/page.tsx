"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Trash2, 
  Search,
  Filter,
  PlusCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);

  // Mock assessment data - in a real application you would fetch this from an API
  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      const mockAssessments = [
        {
          id: "1",
          title: "JavaScript Fundamentals",
          description: "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
          timeLimit: 60,
          questionCount: 20,
          dueDate: "2023-12-31",
          type: "Quiz",
          status: "Active",
          createdAt: "2023-10-15",
          createdBy: "Admin User",
          completions: 15,
          avgScore: 78
        },
        {
          id: "2",
          title: "React Component Architecture",
          description: "Assessment covering React components, props, state, and lifecycle methods.",
          timeLimit: 90,
          questionCount: 15,
          dueDate: "2023-12-25",
          type: "Mixed",
          status: "Active",
          createdAt: "2023-10-18",
          createdBy: "Admin User",
          completions: 8,
          avgScore: 72
        },
        {
          id: "3",
          title: "Data Structures Coding Challenge",
          description: "Solve coding problems related to arrays, linked lists, trees, and graphs.",
          timeLimit: 120,
          questionCount: 5,
          dueDate: "2023-12-20",
          type: "Coding",
          status: "Draft",
          createdAt: "2023-10-20",
          createdBy: "Jane Smith",
          completions: 0,
          avgScore: 0
        },
        {
          id: "4",
          title: "HTML & CSS Basics",
          description: "Assessment on HTML tags, CSS selectors, and responsive design principles.",
          timeLimit: 45,
          questionCount: 25,
          dueDate: "2023-11-15",
          type: "Quiz",
          status: "Completed",
          createdAt: "2023-09-10",
          createdBy: "Admin User",
          completions: 22,
          avgScore: 85
        },
        {
          id: "5",
          title: "Database Design",
          description: "Questions on relational database design, normalization, and SQL queries.",
          timeLimit: 60,
          questionCount: 15,
          dueDate: "2023-11-10",
          type: "Mixed",
          status: "Completed",
          createdAt: "2023-09-15",
          createdBy: "Jane Smith",
          completions: 18,
          avgScore: 79
        }
      ];
      
      setAssessments(mockAssessments);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter assessments based on search query
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectAll = () => {
    if (selectedAssessments.length === assessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(assessments.map((assessment: any) => assessment.id));
    }
  };

  const handleSelectAssessment = (id: string) => {
    if (selectedAssessments.includes(id)) {
      setSelectedAssessments(selectedAssessments.filter((item) => item !== id));
    } else {
      setSelectedAssessments([...selectedAssessments, id]);
    }
  };

  const handleDeleteSelected = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      // API call to delete assessments would go here
      
      toast(`${selectedAssessments.length} assessment(s) deleted successfully`);
      setSelectedAssessments([]);
      // Reload assessments
    } catch (error) {
      toast(`Failed to delete assessments`, {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage assessments for your courses
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assessments..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {selectedAssessments.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedAssessments.length})
              </Button>
            )}
            <Button onClick={() => router.push("/admin/assessments/create")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>
              {filteredAssessments.length} total assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-12 flex-1 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedAssessments.length === assessments.length &&
                          assessments.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <AlertTriangle className="h-10 w-10 mb-2" />
                          <p className="text-lg font-medium">No assessments found</p>
                          <p className="text-sm">
                            Get started by creating your first assessment
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => router.push("/admin/assessments/create")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Assessment
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssessments.map((assessment: any) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAssessments.includes(assessment.id)}
                            onCheckedChange={() => handleSelectAssessment(assessment.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{assessment.title}</TableCell>
                        <TableCell>{assessment.course?.name || "Uncategorized"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assessment.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={assessment.status === "Active" ? "default" : "secondary"}
                          >
                            {assessment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{assessment.questionCount}</TableCell>
                        <TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/assessments/${assessment.id}`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/assessments/${assessment.id}/preview`)}>
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedAssessments([assessment.id]);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment{selectedAssessments.length > 1 ? "s" : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedAssessments.length} assessment{selectedAssessments.length > 1 ? "s" : ""}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 