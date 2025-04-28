"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Play, BookOpen, FileText, Check, Clock, Plus, Video, FileQuestion, Save, PlusCircle, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Submodule {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  order: number;
  content?: SubmoduleContent[];
}

interface Module {
  id: string;
  title: string;
  courseId: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
}

interface SubmoduleContent {
  id: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'document' | 'link';
  title: string;
  description?: string;
  url?: string;
  content?: string;
  duration?: number;
  order: number;
}

export default function SubmoduleEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [submodule, setSubmodule] = useState<Submodule | null>(null);
  const [contents, setContents] = useState<SubmoduleContent[]>([]);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'video' | 'text' | 'quiz' | 'assignment' | 'document' | 'link'>('video');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentDescription, setNewContentDescription] = useState('');
  const [newContentUrl, setNewContentUrl] = useState('');
  const [newContentContent, setNewContentContent] = useState('');
  const [newContentDuration, setNewContentDuration] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch all these from the API
      // For now, we'll simulate the data

      // Fetch course
      const courseData = {
        id: params.id as string,
        title: "Python Basics"
      };
      setCourse(courseData);

      // Fetch module
      const moduleData = {
        id: params.moduleId as string,
        title: "Introduction to Python",
        courseId: params.id as string,
        order: 0
      };
      setModule(moduleData);

      // Fetch submodule
      const submoduleData = {
        id: params.submoduleId as string,
        title: "Getting Started with Python",
        description: "Learn the basics of Python programming language and set up your development environment.",
        moduleId: params.moduleId as string,
        order: 0
      };
      setSubmodule(submoduleData);

      // Fetch content items
      const contentItems = [
        {
          id: "content-1",
          type: 'video' as const,
          title: "Introduction to Python Programming",
          description: "An overview of Python and why it's a great language for beginners",
          url: "https://www.youtube.com/watch?v=example",
          duration: 15,
          order: 0
        },
        {
          id: "content-2",
          type: 'text' as const,
          title: "Setting Up Your Development Environment",
          content: "# Setting Up Python\n\n1. Download Python from python.org\n2. Install Python on your system\n3. Verify installation by running `python --version`",
          order: 1
        },
        {
          id: "content-3",
          type: 'document' as const,
          title: "Python Installation Guide",
          description: "Detailed guide for installing Python on different operating systems",
          url: "/documents/python-installation-guide.pdf",
          order: 2
        }
      ];
      setContents(contentItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load submodule data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id, params.moduleId, params.submoduleId, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, save data to the API
      toast({
        title: "Success",
        description: "Submodule content saved successfully",
      });
    } catch (error) {
      console.error("Error saving submodule:", error);
      toast({
        title: "Error",
        description: "Failed to save submodule content",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submodule) {
      setSubmodule({
        ...submodule,
        title: e.target.value
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (submodule) {
      setSubmodule({
        ...submodule,
        description: e.target.value
      });
    }
  };

  const handleAddContent = () => {
    if (!newContentTitle.trim()) {
      toast({
        title: "Error",
        description: "Content title is required",
        variant: "destructive",
      });
      return;
    }

    const newContent: SubmoduleContent = {
      id: `content-${Date.now()}`,
      type: contentType,
      title: newContentTitle,
      description: newContentDescription || undefined,
      url: contentType === 'video' || contentType === 'document' || contentType === 'link' ? newContentUrl : undefined,
      content: contentType === 'text' ? newContentContent : undefined,
      duration: contentType === 'video' && newContentDuration ? parseInt(newContentDuration) : undefined,
      order: contents.length
    };

    setContents([...contents, newContent]);
    resetContentForm();
    setIsContentDialogOpen(false);

    toast({
      title: "Success",
      description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} content added successfully`,
    });
  };

  const handleDeleteContent = (contentId: string) => {
    setContents(contents.filter(c => c.id !== contentId));
    toast({
      title: "Success",
      description: "Content removed successfully",
    });
  };

  const resetContentForm = () => {
    setNewContentTitle('');
    setNewContentDescription('');
    setNewContentUrl('');
    setNewContentContent('');
    setNewContentDuration('');
  };

  const handleMoveContent = (contentId: string, direction: 'up' | 'down') => {
    const index = contents.findIndex(c => c.id === contentId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === contents.length - 1)
    ) {
      return;
    }

    const newContents = [...contents];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newContents[index], newContents[newIndex]] = [newContents[newIndex], newContents[index]];
    
    // Update order values
    newContents.forEach((content, idx) => {
      content.order = idx;
    });

    setContents(newContents);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{submodule?.title}</h1>
            <p className="text-muted-foreground">
              {course?.title} &rsaquo; {module?.title}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submodule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={submodule?.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Enter submodule title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={submodule?.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Enter submodule description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content</CardTitle>
              <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Content</DialogTitle>
                    <DialogDescription>
                      Add new content to this submodule.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select
                        value={contentType}
                        onValueChange={(value) => setContentType(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="text">Text/Markdown</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content-title">Title</Label>
                      <Input
                        id="content-title"
                        value={newContentTitle}
                        onChange={(e) => setNewContentTitle(e.target.value)}
                        placeholder="Enter content title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content-description">Description</Label>
                      <Textarea
                        id="content-description"
                        value={newContentDescription}
                        onChange={(e) => setNewContentDescription(e.target.value)}
                        placeholder="Enter content description (optional)"
                        rows={3}
                      />
                    </div>
                    {(contentType === 'video' || contentType === 'document' || contentType === 'link') && (
                      <div>
                        <Label htmlFor="content-url">URL</Label>
                        <Input
                          id="content-url"
                          value={newContentUrl}
                          onChange={(e) => setNewContentUrl(e.target.value)}
                          placeholder={`Enter ${contentType} URL`}
                        />
                      </div>
                    )}
                    {contentType === 'text' && (
                      <div>
                        <Label htmlFor="content-text">Content</Label>
                        <Textarea
                          id="content-text"
                          value={newContentContent}
                          onChange={(e) => setNewContentContent(e.target.value)}
                          placeholder="Enter markdown content"
                          rows={6}
                        />
                      </div>
                    )}
                    {contentType === 'video' && (
                      <div>
                        <Label htmlFor="content-duration">Duration (minutes)</Label>
                        <Input
                          id="content-duration"
                          type="number"
                          value={newContentDuration}
                          onChange={(e) => setNewContentDuration(e.target.value)}
                          placeholder="Enter video duration"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddContent}>
                      Add Content
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {contents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No content added yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Add videos, text, quizzes, and other content to enrich this submodule
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsContentDialogOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Content
                      </Button>
                    </div>
                  ) : (
                    contents.map((content, index) => (
                      <div
                        key={content.id}
                        className="border rounded-lg p-4 flex items-start gap-4 relative group"
                      >
                        <div 
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            content.type === 'video' ? 'bg-blue-100 text-blue-600' :
                            content.type === 'text' ? 'bg-green-100 text-green-600' :
                            content.type === 'quiz' ? 'bg-yellow-100 text-yellow-600' :
                            content.type === 'assignment' ? 'bg-purple-100 text-purple-600' :
                            content.type === 'document' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {content.type === 'video' && <Video className="h-5 w-5" />}
                          {content.type === 'text' && <FileText className="h-5 w-5" />}
                          {content.type === 'quiz' && <FileQuestion className="h-5 w-5" />}
                          {content.type === 'assignment' && <Check className="h-5 w-5" />}
                          {content.type === 'document' && <BookOpen className="h-5 w-5" />}
                          {content.type === 'link' && <Play className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                              {content.type}
                            </span>
                            {content.duration && (
                              <span className="ml-2 text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {content.duration} min
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium mt-1">{content.title}</h3>
                          {content.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {content.description}
                            </p>
                          )}
                        </div>
                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveContent(content.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleMoveContent(content.id, 'down')}
                            disabled={index === contents.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Require Completion</h3>
                  <p className="text-sm text-muted-foreground">
                    Students must complete this submodule
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Make Optional</h3>
                  <p className="text-sm text-muted-foreground">
                    Students can skip this submodule
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Visible to Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Show this submodule to students
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how this submodule will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Preview Submodule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>More Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Duplicate Submodule
              </Button>
              <Button className="w-full justify-start text-destructive" variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Submodule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 