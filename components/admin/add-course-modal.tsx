"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSnackbar } from "notistack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const courseFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date(),
  endDate: z.date(),
  categoryId: z.string().min(1, "Please select a category"),
  isVisible: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface AddCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddCourseForm = ({ onSuccess, onOpenChange }: { onSuccess: () => void; onOpenChange: (open: boolean) => void }) => {
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    title: "",
    subtitle: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    categoryId: "",
    isVisible: true,
  };

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
    shouldUnregister: true,
  });

  // Reset form when component mounts
  useEffect(() => {
    form.reset(defaultValues);
    form.clearErrors();
  }, []);

  useEffect(() => {
    if (!open) {
      setFormKey(prev => prev + 1);
    }
  }, [open]);

  

  useEffect(() => {
    if (!isLoadingCategories && (!categories || categories.length === 0)) {
      enqueueSnackbar("Please add a category first before creating a course", {
        variant: "warning",
        autoHideDuration: 5000,
      });
      onOpenChange(false);
    }
  }, [isLoadingCategories, categories, enqueueSnackbar, onOpenChange]);

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      form.reset(defaultValues);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter course title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Input placeholder="Enter course subtitle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : !categories || !Array.isArray(categories) || categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value ? "true" : "false"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Show</SelectItem>
                    <SelectItem value="false">Hide</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <DateTimePicker
                    date={field.value}
                    onChange={field.onChange}
                    maxDate={form.getValues("endDate")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <DateTimePicker
                    date={field.value}
                    onChange={field.onChange}
                    minDate={form.getValues("startDate")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Enter course description..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export function AddCourseModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCourseModalProps) {
  // Force a new form instance each time the modal opens
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (open) {
      setFormKey(prev => prev + 1);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new course.
          </DialogDescription>
        </DialogHeader>
        {open && <AddCourseForm key={formKey} onSuccess={onSuccess} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
} 