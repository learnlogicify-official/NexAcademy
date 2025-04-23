"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Clock, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  marks: number;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Mock data - in a real app, you would fetch this from an API
  const courses = [
    { id: "1", name: "Introduction to Web Development" },
    { id: "2", name: "JavaScript Fundamentals" },
    { id: "3", name: "React Essentials" },
    { id: "4", name: "Node.js Backend Development" },
  ];
  
  const questions: Question[] = [
    { id: "1", name: "JavaScript Variables", type: "MCQ", difficulty: "Easy", marks: 5 },
    { id: "2", name: "CSS Flexbox", type: "MCQ", difficulty: "Medium", marks: 10 },
    { id: "3", name: "React Hooks", type: "MCQ", difficulty: "Hard", marks: 15 },
    { id: "4", name: "Array Manipulation", type: "Coding", difficulty: "Medium", marks: 20 },
    { id: "5", name: "DOM Manipulation", type: "Coding", difficulty: "Hard", marks: 25 },
  ];
  
  const handleSelectAllQuestions = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };
  
  const handleSelectQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };
  
  const calculateTotalMarks = () => {
    return questions
      .filter(q => selectedQuestions.includes(q.id))
      .reduce((sum, q) => sum + q.marks, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      toast("Please select at least one question", {
        description: "An assessment must contain at least one question."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your API
      // const response = await fetch('/api/assessments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast("Assessment created successfully");
      router.push("/admin/assessments");
    } catch (error) {
      toast("Failed to create assessment", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (isSubmitting) return;
    setShowConfirmDialog(true);
  };
  
  return (
    <div className="p-6 space-y-6 container max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create Assessment</h1>
          <p className="text-muted-foreground">
            Create a new assessment for your students
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={() => router.push("/admin/assessments")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>
              Basic information about the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., JavaScript Fundamentals Quiz" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the purpose and content of this assessment"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-limit"
                    type="number"
                    min="1"
                    placeholder="60"
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passing-percentage">Passing Percentage</Label>
                <div className="relative">
                  <Input
                    id="passing-percentage"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="70"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="publish" />
              <Label htmlFor="publish">Publish immediately</Label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Select questions to include in this assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Questions</TabsTrigger>
                  <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
                  <TabsTrigger value="coding">Coding</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {selectedQuestions.length} selected | Total marks: {calculateTotalMarks()}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push("/admin/questions")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedQuestions.length === questions.length && questions.length > 0}
                            onCheckedChange={handleSelectAllQuestions}
                          />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map(question => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => handleSelectQuestion(question.id)}
                            />
                          </TableCell>
                          <TableCell>{question.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              question.difficulty === "Easy" ? "outline" : 
                              question.difficulty === "Medium" ? "secondary" : 
                              "default"
                            }>
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.marks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="mcq" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions
                        .filter(q => q.type === "MCQ")
                        .map(question => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedQuestions.includes(question.id)}
                                onCheckedChange={() => handleSelectQuestion(question.id)}
                              />
                            </TableCell>
                            <TableCell>{question.name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                question.difficulty === "Easy" ? "outline" : 
                                question.difficulty === "Medium" ? "secondary" : 
                                "default"
                              }>
                                {question.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell>{question.marks}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="coding" className="m-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions
                        .filter(q => q.type === "Coding")
                        .map(question => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedQuestions.includes(question.id)}
                                onCheckedChange={() => handleSelectQuestion(question.id)}
                              />
                            </TableCell>
                            <TableCell>{question.name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                question.difficulty === "Easy" ? "outline" : 
                                question.difficulty === "Medium" ? "secondary" : 
                                "default"
                              }>
                                {question.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell>{question.marks}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Any unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => router.push("/admin/assessments")}
              className="bg-destructive text-destructive-foreground"
              type="button"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 