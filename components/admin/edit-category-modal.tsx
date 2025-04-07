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
  const [isLoading, setIsLoading] = useState(false);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    onLoadingChange(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SHOW">Show</SelectItem>
                      <SelectItem value="HIDE">Hide</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <div className="border rounded-md p-2 min-h-[200px]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                        >
                          Bold
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                        >
                          Italic
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        >
                          Bullet List
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        >
                          Numbered List
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                      </div>
                      <EditorContent editor={editor} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 