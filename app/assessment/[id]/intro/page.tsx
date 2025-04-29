"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Clock, FileText, HelpCircle, Info, AlertTriangle, ChevronRight } from "lucide-react"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"

export default function AssessmentInstructionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [timer, setTimer] = useState(10)
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const router = useRouter();

  // Initialize timer from localStorage or default to 10 seconds
  useEffect(() => {
    // Get stored timer data
    const timerKey = `assessment-timer-${id}`;
    const storedTimerData = localStorage.getItem(timerKey);
    
    if (storedTimerData) {
      const { expiresAt } = JSON.parse(storedTimerData);
      const now = new Date().getTime();
      const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      // If timer hasn't expired yet, use the remaining time
      if (timeLeft > 0) {
        setTimer(timeLeft);
      } else {
        setTimer(0);
      }
    } else {
      // If no stored timer, initialize a new one and store it
      const now = new Date().getTime();
      const expiresAt = now + 10 * 1000; // 10 seconds
      localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
      setTimer(10);
    }
  }, [id]);

  useEffect(() => {
    if (timer <= 0) return
    
    const interval = setInterval(() => {
      setTimer(t => {
        const newTimer = t - 1;
        // Update localStorage with remaining time
        const timerKey = `assessment-timer-${id}`;
        const now = new Date().getTime();
        const expiresAt = now + newTimer * 1000;
        localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
        return newTimer;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, id]);

  useEffect(() => {
    async function fetchAssessment() {
      setLoading(true)
      try {
        const res = await fetch(`/api/assessments/${id}`)
        if (!res.ok) throw new Error("Failed to fetch assessment")
        const data = await res.json()
        setAssessment(data)
      } catch (e) {
        setAssessment(null)
      } finally {
        setLoading(false)
      }
    }
    fetchAssessment()
  }, [id])

  const assessmentName = loading ? "..." : assessment?.name || assessment?.title || "Assessment"
  const assessmentDuration = loading ? "..." : (assessment?.duration || assessment?.timeLimit || 0) + " min"
  const passingScore = loading ? "..." : (assessment?.passingMarks || assessment?.passingPercentage || assessment?.gradeToPass || 0)
  const courseName = loading ? "..." : assessment?.courseName || assessment?.course?.title || assessment?.course?.name || "Course"
  const moduleName = loading ? "..." : assessment?.moduleName || assessment?.module?.title || assessment?.module?.name || "Module"

  async function startAttempt() {
    try {
      setStarting(true);
      // Use a real userId in production; for now, fallback to a valid userId
      const userId = "cma1ewcgj00008zw70fyhea3q";
      const res = await fetch(`/api/assessments/${id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        setStarting(false);
        return alert("Failed to start attempt");
      }
      const attempt = await res.json();
      router.replace(`/assessment/${id}/test?attemptId=${attempt.id}`);
    } catch (e) {
      setStarting(false);
      alert("Could not start attempt");
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Modern Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm text-sm">
        <a className="hover:underline text-blue-700 dark:text-blue-300 font-medium transition-colors" href="#">
          {courseName}
        </a>
        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
        <a className="hover:underline text-blue-700 dark:text-blue-300 font-medium transition-colors" href="#">
          {moduleName}
        </a>
        <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
        <span className="font-semibold text-gray-900 dark:text-white">{assessmentName}</span>
      </nav>

      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{assessmentName}</h1>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {timer > 0 ? `Begin enabled in ${timer}s` : "You may begin"}
          </span>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="submission">Submission</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Assessment Overview
              </CardTitle>
              <CardDescription>Key information about this assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Duration</h3>
                    <p className="text-sm text-muted-foreground">{assessmentDuration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Format</h3>
                    <p className="text-sm text-muted-foreground">Multiple choice and short answer questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Passing Score</h3>
                    <p className="text-sm text-muted-foreground">{passingScore}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Support</h3>
                    <p className="text-sm text-muted-foreground">Email support@example.com for technical issues</p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  This assessment is designed to evaluate your understanding of the course material. Your results will
                  be used to identify areas for improvement.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detailed Instructions
              </CardTitle>
              <CardDescription>Step-by-step guide to completing the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Preparation</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure you have a stable internet connection and a quiet environment. Have a pen and paper ready
                      for any calculations or notes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Login</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the credentials provided in your email to log in to the assessment platform. If you haven't
                      received credentials, contact support immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Taking the Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Read each question carefully. You can mark questions for review and return to them later. The
                      timer will be visible throughout the assessment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-foreground">
                    4
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">Submission</h3>
                    <p className="text-sm text-muted-foreground">
                      Review all your answers before submitting. Once submitted, you cannot return to the assessment.
                      You'll receive your results via email within 48 hours.
                    </p>
                  </div>
                </div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Attempting to use unauthorized resources or navigating away from the assessment page may result in
                  automatic submission or disqualification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Technical Requirements
              </CardTitle>
              <CardDescription>System and browser requirements for the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Supported Browsers</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Google Chrome (latest version)</li>
                    <li>Mozilla Firefox (latest version)</li>
                    <li>Microsoft Edge (latest version)</li>
                    <li>Safari (latest version)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">System Requirements</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Stable internet connection (minimum 1 Mbps)</li>
                    <li>JavaScript enabled</li>
                    <li>Cookies enabled</li>
                    <li>Screen resolution of at least 1280x720</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Required Materials</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Calculator (non-programmable)</li>
                  <li>Pen and paper for notes</li>
                  <li>Student ID or government-issued photo ID</li>
                  <li>Quiet environment free from distractions</li>
                </ul>
              </div>

              <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Compatibility Check</AlertTitle>
                <AlertDescription className="text-amber-700">
                  We recommend running the system compatibility check at least 24 hours before your scheduled assessment
                  time to resolve any technical issues.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Run Compatibility Check
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="submission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submission Guidelines
              </CardTitle>
              <CardDescription>How to properly submit your assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Submission Process</h3>
                <p className="text-sm text-muted-foreground">
                  When you've completed all questions, click the "Review" button to see a summary of your answers. You
                  can return to any question to modify your answer before final submission. Once you're satisfied with
                  all answers, click the "Submit Assessment" button.
                </p>

                <h3 className="font-medium">After Submission</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an on-screen confirmation of your submission. A confirmation email will also be sent to
                  your registered email address. Results will be available within 48 hours in your student portal.
                </p>

                <h3 className="font-medium">Technical Issues</h3>
                <p className="text-sm text-muted-foreground">
                  If you encounter technical difficulties during the assessment, first try refreshing the page. Your
                  progress is saved automatically. If problems persist, contact technical support immediately at
                  support@example.com or call (555) 123-4567.
                </p>
              </div>

              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Submission Checklist</AlertTitle>
                <AlertDescription className="text-green-700">
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Answer all required questions</li>
                    <li>Review your answers for accuracy</li>
                    <li>Ensure you've completed any file uploads if required</li>
                    <li>Submit before the time limit expires</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto">
                Practice Submission
              </Button>
              <Button disabled={timer > 0 || starting} onClick={startAttempt}>
                {starting ? "Starting..." : "Begin Assessment"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-between">
        <Button variant="outline">Back to Dashboard</Button>
        <Button disabled={timer > 0 || starting} onClick={startAttempt}>
          {starting ? "Starting..." : "Begin Assessment"}
        </Button>
      </div>
    </div>
  )
}
