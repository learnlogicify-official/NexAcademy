"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle, XCircle } from "lucide-react"

interface Assignment {
  id: number
  title: string
  course: string
  courseId: number
  dueDate: string
  xpReward: number
  status: string
  description: string
  progress: number
  submittedAt?: string
  grade?: {
    score: number
    feedback: string
    xpEarned: number
  }
}

interface SubmissionModalProps {
  assignment: Assignment
  isOpen: boolean
  onClose: () => void
}

export function SubmissionModal({ assignment, isOpen, onClose }: SubmissionModalProps) {
  const [activeTab, setActiveTab] = useState("results")

  // Mock test cases for the assignment
  const testCases = [
    {
      id: 1,
      name: "Basic Functionality",
      passed: true,
      description: "Tests if the basic functionality works as expected",
    },
    {
      id: 2,
      name: "Edge Cases",
      passed: true,
      description: "Tests edge cases like empty inputs and boundary values",
    },
    {
      id: 3,
      name: "Performance",
      passed: false,
      description: "Tests if the solution performs within acceptable time limits",
    },
    {
      id: 4,
      name: "Code Quality",
      passed: true,
      description: "Evaluates code structure, readability, and best practices",
    },
  ]

  // Mock submitted code
  const submittedCode = `function createAnimation(element) {
  // Create keyframes for the animation
  const keyframes = [
    { transform: 'scale(1)', opacity: 1, offset: 0 },
    { transform: 'scale(1.5)', opacity: 0.5, offset: 0.3 },
    { transform: 'scale(0.8)', opacity: 0.8, offset: 0.6 },
    { transform: 'scale(1.2)', opacity: 0.9, offset: 0.8 },
    { transform: 'scale(1)', opacity: 1, offset: 1 }
  ];
  
  // Animation options
  const options = {
    duration: 2000,
    iterations: Infinity,
    easing: 'ease-in-out',
    direction: 'alternate'
  };
  
  // Start the animation
  return element.animate(keyframes, options);
}

// Apply animation to elements
document.querySelectorAll('.animated-element').forEach(el => {
  createAnimation(el);
});`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            {assignment.course} • Submitted on{" "}
            {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : "N/A"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="code">Submitted Code</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="gap-1 bg-green-500 text-white">
                      <Award className="h-3 w-3" /> Grade: {assignment.grade?.score}%
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Award className="h-3 w-3" /> Earned: {assignment.grade?.xpEarned} XP
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testCases.filter((tc) => tc.passed).length} of {testCases.length} tests passed
                  </div>
                </div>

                <Progress
                  value={(testCases.filter((tc) => tc.passed).length / testCases.length) * 100}
                  className="h-2"
                />

                <div className="space-y-2">
                  {testCases.map((testCase) => (
                    <div key={testCase.id} className="flex items-start gap-2 rounded-md border p-2">
                      {testCase.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{testCase.name}</div>
                        <div className="text-sm text-muted-foreground">{testCase.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Submitted Code</CardTitle>
                <CardDescription>CSS Animations Challenge submission</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="max-h-96 overflow-auto rounded-md bg-secondary p-4 text-sm">
                  <code>{submittedCode}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Instructor Feedback</CardTitle>
                <CardDescription>Feedback provided on {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-secondary p-4">
                  <p className="italic text-muted-foreground">
                    "
                    {assignment.grade?.feedback ||
                      "Excellent work! Your animations are smooth and creative. Consider optimizing performance for mobile devices."}
                    "
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Strengths:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Creative use of keyframes and timing functions</li>
                    <li>Clean, well-structured code</li>
                    <li>Good documentation and comments</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Areas for Improvement:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Consider performance optimizations for complex animations</li>
                    <li>Test on different browsers for compatibility</li>
                    <li>Add fallbacks for browsers that don't support modern animation features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

