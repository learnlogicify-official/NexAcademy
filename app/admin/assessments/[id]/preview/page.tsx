"use client";

import React, { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, AlarmClock, AlertTriangle, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: MCQOption[];
  codeSnippet?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingPercentage: number;
  type: string;
  status: string;
  courseId: string;
  courseName: string;
  questions: Question[];
  totalMarks: number;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function AssessmentPreviewPage({ params }: PageProps) {
  const resolvedParams = use(params) as { id: string }
  const { id } = resolvedParams
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch the assessment data from your API
        // const response = await fetch(`/api/assessments/${id}/preview`);
        // const data = await response.json();
        
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAssessment: Assessment = {
          id: id,
          title: "JavaScript Fundamentals Quiz",
          description: "Test your knowledge of JavaScript basics including variables, functions, and control flow.",
          timeLimit: 60,
          passingPercentage: 70,
          type: "quiz",
          status: "Active",
          courseId: "2",
          courseName: "JavaScript Fundamentals",
          totalMarks: 50,
          questions: [
            {
              id: "1",
              text: "Which of the following is NOT a JavaScript data type?",
              type: "MCQ",
              difficulty: "Easy",
              marks: 5,
              options: [
                { id: "1", text: "Number", isCorrect: false },
                { id: "2", text: "Boolean", isCorrect: false },
                { id: "3", text: "Float", isCorrect: true },
                { id: "4", text: "String", isCorrect: false }
              ]
            },
            {
              id: "2",
              text: "What is the correct way to declare a variable in JavaScript?",
              type: "MCQ",
              difficulty: "Easy",
              marks: 5,
              options: [
                { id: "1", text: "var name;", isCorrect: true },
                { id: "2", text: "variable name;", isCorrect: false },
                { id: "3", text: "v name;", isCorrect: false },
                { id: "4", text: "declare name;", isCorrect: false }
              ]
            },
            {
              id: "3",
              text: "Write a function that finds the maximum value in an array.",
              type: "Coding",
              difficulty: "Medium",
              marks: 15,
              codeSnippet: "function findMax(arr) {\n  // Your code here\n}"
            },
            {
              id: "4",
              text: "What does the following code output?\n\nconst x = 10;\nlet y = 5;\nconsole.log(x + y);",
              type: "MCQ",
              difficulty: "Easy",
              marks: 5,
              options: [
                { id: "1", text: "15", isCorrect: true },
                { id: "2", text: "105", isCorrect: false },
                { id: "3", text: "Error", isCorrect: false },
                { id: "4", text: "undefined", isCorrect: false }
              ]
            },
            {
              id: "5",
              text: "Implement a function that reverses a string without using the built-in reverse() method.",
              type: "Coding",
              difficulty: "Medium",
              marks: 20,
              codeSnippet: "function reverseString(str) {\n  // Your code here\n}"
            }
          ]
        };
        
        setAssessment(mockAssessment);
      } catch (error) {
        toast("Failed to load assessment", {
          description: "Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);
  
  const handleNextQuestion = () => {
    if (assessment && activeQuestionIndex < assessment.questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };
  
  const handleQuestionTabClick = (index: number) => {
    setActiveQuestionIndex(index);
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 container max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-8">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!assessment) {
    return (
      <div className="p-6 space-y-6 container max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="text-2xl font-bold">Assessment Not Found</h2>
            <p className="text-muted-foreground">
              The assessment you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/admin/assessments")}>
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const activeQuestion = assessment.questions[activeQuestionIndex];
  const progressPercentage = ((activeQuestionIndex + 1) / assessment.questions.length) * 100;
  
  return (
    <div className="p-6 space-y-6 container max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{assessment.title} (Preview)</h1>
          <p className="text-muted-foreground">
            Course: {assessment.courseName} | 
            Time Limit: {assessment.timeLimit} minutes | 
            Passing: {assessment.passingPercentage}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/assessments/${id}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </Button>
      </div>
      
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preview Mode</CardTitle>
              <CardDescription>{assessment.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlarmClock className="h-4 w-4" />
              <span>{assessment.timeLimit} minutes</span>
              <span>|</span>
              <span>{assessment.totalMarks} total marks</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Question {activeQuestionIndex + 1} of {assessment.questions.length}</span>
              <span>{progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="grid grid-cols-12 gap-6">
          {/* Question Navigator */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="font-medium text-sm mb-2">Question Navigator</div>
            <div className="grid grid-cols-5 gap-2">
              {assessment.questions.map((question, index) => (
                <Button
                  key={question.id}
                  variant={activeQuestionIndex === index ? "default" : "outline"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => handleQuestionTabClick(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">MCQ</Badge>
                <span className="text-sm">Multiple Choice</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50">Coding</Badge>
                <span className="text-sm">Programming</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Question Details</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">
                    {activeQuestion.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <Badge variant={
                    activeQuestion.difficulty === "Easy" ? "outline" : 
                    activeQuestion.difficulty === "Medium" ? "secondary" : 
                    "default"
                  }>
                    {activeQuestion.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marks:</span>
                  <span>{activeQuestion.marks}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="space-y-4">
              <div className="text-lg font-medium">
                Question {activeQuestionIndex + 1}: {activeQuestion.text}
              </div>
              
              {activeQuestion.type === "MCQ" && activeQuestion.options && (
                <div className="space-y-4">
                  <RadioGroup defaultValue="">
                    {activeQuestion.options.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`}>{option.text}</Label>
                        
                        {/* Show correct answer indicator in preview mode */}
                        {option.isCorrect ? (
                          <Check className="h-4 w-4 text-green-600 ml-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="text-sm text-muted-foreground italic mt-4">
                    <span className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-1" /> 
                      Correct answer
                    </span>
                  </div>
                </div>
              )}
              
              {activeQuestion.type === "Coding" && (
                <div className="space-y-4">
                  <div className="border rounded-md p-3 bg-muted/40">
                    <pre className="text-sm font-mono overflow-x-auto">
                      {activeQuestion.codeSnippet}
                    </pre>
                  </div>
                  
                  <div>
                    <Label htmlFor="answer" className="text-sm font-medium">Your Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder="Write your code here..."
                      className="font-mono"
                      rows={10}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                disabled={activeQuestionIndex === 0}
                onClick={handlePreviousQuestion}
              >
                Previous
              </Button>
              
              <Button
                disabled={activeQuestionIndex === assessment.questions.length - 1}
                onClick={handleNextQuestion}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
          <div className="text-sm text-muted-foreground">
            This is a preview mode. Student responses are not saved.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/admin/assessments/${id}`)}
          >
            Exit Preview
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 