"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Editor } from "@/components/editor";

const formSchema = z.object({
  // Basic Details
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  status: z.enum(["DRAFT", "READY", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  folderId: z.string().min(1, "Folder is required"),

  // Timing
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  duration: z.number().int().positive().optional(),

  // Grade Settings
  totalMarks: z.number().int().positive().default(100),
  passingMarks: z.number().int().min(0),

  // Display Settings
  displayDescription: z.boolean().default(false),
  timeBoundEnabled: z.boolean().default(false),
  timeLimitEnabled: z.boolean().default(false),
  gradeCategory: z.string().optional(),
  gradeToPass: z.number().optional(),
  attemptsAllowed: z.number().int().min(1).nullable(),
  unlimitedAttempts: z.boolean().default(false),
  navigationMethod: z.string().default("free"),
  shuffleWithinQuestions: z.boolean().default(false),
  questionBehaviourMode: z.string().default("deferredfeedback"),
  reviewDuringAttempt: z.boolean().default(false),
  reviewImmediatelyAfterAttempt: z.boolean().default(false),
  reviewLaterWhileOpen: z.boolean().default(false),
  reviewAfterClose: z.boolean().default(false),
  showUserPicture: z.boolean().default(false),
  decimalPlacesInGrades: z.number().int().default(2),
  decimalPlacesInMarks: z.number().int().default(2),
  requirePassword: z.boolean().default(false),
  webcamIdentityValidation: z.boolean().default(false),
  proctoring: z.enum(["proctoring", "not_proctoring"]).default("not_proctoring"),
  disableRightClick: z.boolean().default(false),
  disableCopyPaste: z.boolean().default(false),
});

const QUESTION_BEHAVIOUR_MODES = [
  {
    value: "deferredfeedback",
    label: "Deferred Feedback",
    description: "Students answer all questions and submit before seeing any feedback."
  },
  {
    value: "immediate",
    label: "Immediate Feedback",
    description: "Students receive feedback immediately after answering each question."
  },
  {
    value: "adaptive",
    label: "Adaptive Mode",
    description: "The next question adapts based on the student's previous answer."
  },
  {
    value: "interactive",
    label: "Interactive (Multiple Tries)",
    description: "Students can attempt each question multiple times, possibly with hints or partial credit."
  },
  {
    value: "manual",
    label: "Manual Grading",
    description: "Some or all questions require instructor review and grading."
  },
  {
    value: "open",
    label: "Open Navigation",
    description: "Students can freely move between questions and change answers before submitting."
  },
  {
    value: "sequential",
    label: "Sequential Navigation",
    description: "Students must answer questions in order and cannot return to previous questions."
  },
];

export default function EditAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [assessmentId, setAssessmentId] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      displayDescription: false,
      status: "DRAFT",
      timeBoundEnabled: false,
      timeLimitEnabled: false,
      attemptsAllowed: 1,
      navigationMethod: "free",
      shuffleWithinQuestions: false,
      questionBehaviourMode: "deferredfeedback",
      reviewDuringAttempt: false,
      reviewImmediatelyAfterAttempt: false,
      reviewLaterWhileOpen: false,
      reviewAfterClose: false,
      showUserPicture: false,
      decimalPlacesInGrades: 2,
      decimalPlacesInMarks: 2,
      requirePassword: false,
      webcamIdentityValidation: false,
      unlimitedAttempts: false,
      proctoring: "not_proctoring",
      disableRightClick: false,
      disableCopyPaste: false,
      passingMarks: 0,
      totalMarks: 100,
      folderId: "",
    },
  });

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setAssessmentId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!assessmentId) return;

    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assessment");
        }
        const data = await response.json();
        setAssessment(data);
        
        // Update form with fetched data
        form.reset({
          name: data.name || "",
          description: data.description || "",
          status: data.status || "DRAFT",
          folderId: data.folderId || "",
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          duration: data.duration || undefined,
          totalMarks: data.totalMarks || 100,
          passingMarks: data.passingMarks || 0,
          displayDescription: data.displayDescription || false,
          timeBoundEnabled: data.timeBoundEnabled || false,
          timeLimitEnabled: data.timeLimitEnabled || false,
          attemptsAllowed: data.attemptsAllowed || 1,
          unlimitedAttempts: data.unlimitedAttempts || false,
          navigationMethod: data.navigationMethod || "free",
          shuffleWithinQuestions: data.shuffleWithinQuestions || false,
          questionBehaviourMode: data.questionBehaviourMode || "deferredfeedback",
          reviewDuringAttempt: data.reviewDuringAttempt || false,
          reviewImmediatelyAfterAttempt: data.reviewImmediatelyAfterAttempt || false,
          reviewLaterWhileOpen: data.reviewLaterWhileOpen || false,
          reviewAfterClose: data.reviewAfterClose || false,
          showUserPicture: data.showUserPicture || false,
          decimalPlacesInGrades: data.decimalPlacesInGrades || 2,
          decimalPlacesInMarks: data.decimalPlacesInMarks || 2,
          requirePassword: data.requirePassword || false,
          webcamIdentityValidation: data.webcamIdentityValidation || false,
          proctoring: data.proctoring || "not_proctoring",
          disableRightClick: data.disableRightClick || false,
          disableCopyPaste: data.disableCopyPaste || false,
        });
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast.error("Failed to load assessment");
      }
    };

    fetchAssessment();
  }, [assessmentId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Check for required fields
      if (!values.name) {
        toast.error("Assessment name is required");
        setIsLoading(false);
        return;
      }

      if (values.timeBoundEnabled && (!values.startDate || !values.endDate)) {
        toast.error("Start date and end date are required for time-bound assessments");
        setIsLoading(false);
        return;
      }
      
      if (values.timeLimitEnabled && !values.duration) {
        toast.error("Duration is required when time limit is enabled");
        setIsLoading(false);
        return;
      }
      
      // Transform the form data to match the API schema
      const transformedData = {
        name: values.name,
        description: values.description,
        status: values.status,
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
        folderId: values.folderId || assessment.folderId,
        startDate: values.startDate,
        endDate: values.endDate,
        duration: values.duration,
        timeBoundEnabled: values.timeBoundEnabled,
        timeLimitEnabled: values.timeLimitEnabled,
        navigationMethod: values.navigationMethod,
        shuffleWithinQuestions: values.shuffleWithinQuestions,
        questionBehaviourMode: values.questionBehaviourMode,
        unlimitedAttempts: values.unlimitedAttempts,
        attemptsAllowed: values.attemptsAllowed,
        reviewDuringAttempt: values.reviewDuringAttempt,
        reviewImmediatelyAfterAttempt: values.reviewImmediatelyAfterAttempt,
        reviewLaterWhileOpen: values.reviewLaterWhileOpen,
        reviewAfterClose: values.reviewAfterClose,
        proctoring: values.proctoring,
        disableRightClick: values.disableRightClick,
        disableCopyPaste: values.disableCopyPaste,
        displayDescription: values.displayDescription
      };

      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update assessment");
      }

      toast.success("Assessment updated successfully");
      router.push("/admin/assessments");
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!assessment) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Edit Assessment</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push("/admin/assessments")}
              >
                Back to Assessments
              </Button>
              <Button 
                type="button" 
                disabled={isLoading}
                onClick={() => {
                  const values = form.getValues();
                  onSubmit(values);
                }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="grading">Grading</TabsTrigger>
              <TabsTrigger value="behavior">Question Behavior</TabsTrigger>
              <TabsTrigger value="review">Review Options</TabsTrigger>
              <TabsTrigger value="extra">Extra Settings</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
        <Card>
          <CardHeader>
                  <CardTitle>Basic Details</CardTitle>
            <CardDescription>
                    Set the basic information for your assessment
            </CardDescription>
          </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter assessment name" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Editor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Enter assessment description..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayDescription"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Display Description</FormLabel>
                          <FormDescription>
                            Show description on the assessment page
                          </FormDescription>
              </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          defaultValue={field.value ?? ""}
                        >
                          <FormControl>
                  <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                          </FormControl>
                  <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="READY">Ready</SelectItem>
                  </SelectContent>
                </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timing">
              <Card>
                <CardHeader>
                  <CardTitle>Timing</CardTitle>
                  <CardDescription>
                    Configure when the assessment will be available and its duration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="timeBoundEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Time Bound Assessment</FormLabel>
                          <FormDescription>
                            Enable to set start and end dates for the assessment
                          </FormDescription>
            </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("timeBoundEnabled") && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => {
                          const dateValue = field.value ? new Date(field.value) : null;
                          const formattedValue = dateValue ? new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
                          
                          return (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                  <Input
                    type="datetime-local"
                                  value={formattedValue}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const [date, time] = e.target.value.split('T');
                                      const [year, month, day] = date.split('-').map(Number);
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const newDate = new Date(year, month - 1, day, hours, minutes);
                                      field.onChange(newDate);
                                    } else {
                                      field.onChange(null);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => {
                          const dateValue = field.value ? new Date(field.value) : null;
                          const formattedValue = dateValue ? new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
                          
                          return (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                  <Input
                    type="datetime-local"
                                  value={formattedValue}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const [date, time] = e.target.value.split('T');
                                      const [year, month, day] = date.split('-').map(Number);
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const newDate = new Date(year, month - 1, day, hours, minutes);
                                      field.onChange(newDate);
                                    } else {
                                      field.onChange(null);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                  />
                </div>
                  )}

                  <FormField
                    control={form.control}
                    name="timeLimitEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Time Limit</FormLabel>
                          <FormDescription>
                            Set a time limit for completing the assessment
                          </FormDescription>
              </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("timeLimitEnabled") && (
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                  <Input
                    type="number"
                              min={1}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grading">
              <Card>
                <CardHeader>
                  <CardTitle>Grading</CardTitle>
                  <CardDescription>
                    Configure grading settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="passingMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unlimitedAttempts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Unlimited Attempts</FormLabel>
                          <FormDescription>
                            Allow students to take the assessment as many times as they want
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("attemptsAllowed", null);
                              } else {
                                form.setValue("attemptsAllowed", 1);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.watch("unlimitedAttempts") && (
                    <FormField
                      control={form.control}
                      name="attemptsAllowed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attempts Allowed</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        
            <TabsContent value="behavior">
        <Card>
          <CardHeader>
                  <CardTitle>Question Behavior</CardTitle>
            <CardDescription>
                    Configure how questions behave during the assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                  <div className="mb-2 p-3 bg-muted rounded">
                    <strong>Instructions:</strong>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {QUESTION_BEHAVIOUR_MODES.map((mode) => (
                        <li key={mode.value}>
                          <span className="font-medium">{mode.label}:</span> {mode.description}
                        </li>
                      ))}
                    </ul>
              </div>
                  <FormField
                    control={form.control}
                    name="questionBehaviourMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Behaviour Mode</FormLabel>
                <Select 
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          defaultValue={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select behaviour mode" />
                  </SelectTrigger>
                          </FormControl>
                  <SelectContent>
                            {QUESTION_BEHAVIOUR_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value}>
                                {mode.label}
                              </SelectItem>
                            ))}
                  </SelectContent>
                </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shuffleWithinQuestions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 mt-2">
                <div className="space-y-0.5">
                          <FormLabel>Shuffle Questions</FormLabel>
                          <FormDescription>
                            Randomize the order of questions for each attempt.
                          </FormDescription>
                </div>
                        <FormControl>
                <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
          </CardContent>
        </Card>
            </TabsContent>
        
            <TabsContent value="review">
        <Card>
          <CardHeader>
                  <CardTitle>Review Options</CardTitle>
                <CardDescription>
                    Configure when students can review their attempts
                </CardDescription>
          </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="reviewDuringAttempt"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Review During Attempt</FormLabel>
                          <FormDescription>
                            Allow review during the attempt
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewImmediatelyAfterAttempt"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Immediate Review</FormLabel>
                          <FormDescription>
                            Allow review immediately after attempt
                          </FormDescription>
                    </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewLaterWhileOpen"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Later Review While Open</FormLabel>
                          <FormDescription>
                            Allow review later, while still open
                          </FormDescription>
                      </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewAfterClose"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Review After Close</FormLabel>
                          <FormDescription>
                            Allow review after the assessment closes
                          </FormDescription>
                      </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
          </CardContent>
        </Card>
            </TabsContent>
        
            <TabsContent value="extra">
        <Card>
          <CardHeader>
                  <CardTitle>Extra Settings</CardTitle>
            <CardDescription>
                    Additional security and validation settings
            </CardDescription>
          </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="proctoring"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proctoring</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""} defaultValue={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proctoring option" />
                              </SelectTrigger>
                          </FormControl>
                              <SelectContent>
                            <SelectItem value="proctoring">Proctoring</SelectItem>
                            <SelectItem value="not_proctoring">Not Proctoring</SelectItem>
                              </SelectContent>
                            </Select>
                        <FormDescription>
                          Choose whether to enable proctoring for this assessment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disableRightClick"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Disable Right Click</FormLabel>
                          <FormDescription>
                            Prevent students from using right-click during the assessment.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disableCopyPaste"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Disable Copy-Paste</FormLabel>
                          <FormDescription>
                            Prevent students from copying or pasting during the assessment.
                          </FormDescription>
                </div>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
          </CardContent>
        </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Manage questions for this assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Button
                      onClick={() => router.push(`/admin/assessments/${assessmentId}/questions`)}
                    >
                      Manage Questions
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click to add or remove questions from this assessment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </form>
      </Form>
    </div>
  );
} 