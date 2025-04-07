"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Quote } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  visibility: z.enum(["SHOW", "HIDE"]),
});

interface EditCategoryModalProps {
  category: {
    id: string;
    name: string;
    description: string;
    visibility: "SHOW" | "HIDE";
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onLoadingChange: (loading: boolean) => void;
}

export function EditCategoryModal({
  category,
  open,
  onOpenChange,
  onSuccess,
  onLoadingChange,
}: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [visibility, setVisibility] = useState<"SHOW" | "HIDE">(category.visibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: category.description || "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      form.setValue("description", content === "<p></p>" ? "" : content);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      visibility: category.visibility,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category.name,
        description: category.description,
        visibility: category.visibility,
      });
      editor?.commands.setContent(category.description || "");
    }
  }, [open, category, form, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onLoadingChange(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          visibility,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to your category here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <RadioGroup
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as "SHOW" | "HIDE")}
                  className="flex"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SHOW" id="show" />
                    <Label htmlFor="show">Show</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HIDE" id="hide" />
                    <Label htmlFor="hide">Hide</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 