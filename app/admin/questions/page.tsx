"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Loader2, Folder, FolderOpen, FileText, Code, Pencil, Trash2, Upload, Download, MoreVertical } from "lucide-react";
import QuestionFormModal from "@/components/admin/question-form-modal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const questionFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Question type is required'),
  points: z.number().min(0, 'Points must be non-negative'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  hidden: z.boolean(),
  singleAnswer: z.boolean(),
  shuffleAnswers: z.boolean(),
  folderId: z.string().min(1, 'Folder is required'),
  subfolderId: z.string().optional(),
});

interface Question {
  id: string;
  title: string;
  description: string;
  type: string;
  options: string[];
  correctAnswers: string[];
  points: number;
  difficulty: string;
  tags: string[];
  hidden: boolean;
  singleAnswer: boolean;
  shuffleAnswers: boolean;
  folderId: string;
  subfolderId?: string;
  status: "READY" | "DRAFT" | "NEEDS_REVIEW";
  version: number;
  createdBy: {
    name: string;
    id: string;
  };
  comments: number;
  needsChecking: boolean;
  facilityIndex: number | null;
  discriminativeEfficiency: number | null;
  usage: number;
  lastUsed: string | null;
  modifiedBy: {
    name: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  subfolders: {
    id: string;
    name: string;
  }[];
}

export default function AdminQuestionsPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateSubfolderModalOpen, setIsCreateSubfolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [selectedFolderForSubfolder, setSelectedFolderForSubfolder] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [updatedFolderName, setUpdatedFolderName] = useState("");
  const [showSubcategories, setShowSubcategories] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchQuestions();
    fetchFolders();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log("Fetching questions...");
      const response = await fetch("/api/questions");
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.details || "Failed to fetch questions");
      }
      
      const data = await response.json();
      console.log("Fetched questions:", data);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async () => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      fetchFolders();
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubfolder = async () => {
    try {
      const response = await fetch(`/api/folders/${selectedFolderForSubfolder}/subfolders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSubfolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subfolder");
      }

      toast({
        title: "Success",
        description: "Subfolder created successfully",
      });

      fetchFolders();
      setNewSubfolderName("");
      setSelectedFolderForSubfolder("");
    } catch (error) {
      console.error("Error creating subfolder:", error);
      toast({
        title: "Error",
        description: "Failed to create subfolder",
        variant: "destructive",
      });
    }
  };

  const handleEditFolder = async (folder: Folder) => {
    setEditingFolder(folder);
    setIsEditFolderModalOpen(true);
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder) return;

    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: updatedFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update folder");
      }

      toast({
        title: "Success",
        description: "Folder updated successfully",
      });

      fetchFolders();
      setIsEditFolderModalOpen(false);
      setUpdatedFolderName("");
      setEditingFolder(null);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });

      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false;
    const matchesFolder = !selectedFolder || question.folderId === selectedFolder;
    const matchesSubfolder =
      !selectedSubfolder || question.subfolderId === selectedSubfolder;
    return matchesSearch && matchesFolder && matchesSubfolder;
  });

  const handleQuestionSubmit = async (data: Question) => {
    try {
      const url = data.id ? `/api/questions/${data.id}` : '/api/questions';
      const method = data.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      toast({
        title: 'Success',
        description: data.id ? 'Question updated successfully' : 'Question created successfully',
      });

      setIsFormModalOpen(false);
      setEditingQuestion(undefined);
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Manage and organize your questions</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Moodle XML format
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                GIFT format
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={() => setIsCreateFolderModalOpen(true)} variant="outline">
            <Folder className="h-4 w-4 mr-2" />
            New Category
          </Button>
          
          <Button 
            onClick={() => setIsFormModalOpen(true)}
            disabled={folders.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={selectedFolder}
                    onValueChange={(value) => {
                      setSelectedFolder(value);
                      setSelectedSubfolder("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any status</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showSubcategories"
                    checked={showSubcategories}
                    onCheckedChange={(checked) => setShowSubcategories(checked === true)}
                  />
                  <Label htmlFor="showSubcategories">Show Subcategories</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showHidden"
                    checked={showHidden}
                    onCheckedChange={(checked) => setShowHidden(checked === true)}
                  />
                  <Label htmlFor="showHidden">Show Hidden Questions</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="border-b p-4 flex items-center justify-between bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={bulkSelected.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelected(filteredQuestions.map(q => q.id));
                        } else {
                          setBulkSelected([]);
                        }
                      }}
                    />
                    <span className="text-sm font-medium">
                      {bulkSelected.length > 0 ? `${bulkSelected.length} selected` : "Select all"}
                    </span>
                  </div>
                  {bulkSelected.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Move to...
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium"></th>
                      <th className="text-left p-4 font-medium">Question</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-center p-4 font-medium">Status</th>
                      <th className="text-center p-4 font-medium">Mark</th>
                      <th className="text-center p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id} className="border-b">
                        <td className="p-4">
                          <Checkbox
                            checked={bulkSelected.includes(question.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkSelected([...bulkSelected, question.id]);
                              } else {
                                setBulkSelected(bulkSelected.filter(id => id !== question.id));
                              }
                            }}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {question.type === "MULTIPLE_CHOICE" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Code className="h-4 w-4" />
                            )}
                            <span className={question.hidden ? "text-muted-foreground" : ""}>
                              {question.title}
                            </span>
                            {question.hidden && (
                              <Badge variant="secondary">Hidden</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {question.type === "MULTIPLE_CHOICE" ? "Multiple Choice" : "Coding"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {folders.find(f => f.id === question.folderId)?.name}
                          {question.subfolderId && (
                            <>
                              <ChevronRight className="inline h-4 w-4 mx-1" />
                              {folders
                                .find(f => f.id === question.folderId)
                                ?.subfolders.find(s => s.id === question.subfolderId)?.name}
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <Badge
                              variant={
                                question.status === "READY"
                                  ? "default"
                                  : question.status === "DRAFT"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-center">{question.points}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Move to...
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {folders.map((folder) => (
                  <div key={folder.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span className="font-medium">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {folder.subfolders.length > 0 && (
                      <div className="pl-6 space-y-2">
                        {folder.subfolders.map((subfolder) => (
                          <div key={subfolder.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>{subfolder.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">Moodle XML format</h3>
                    <p className="text-sm text-muted-foreground">
                      Import questions from a Moodle XML file
                    </p>
                  </div>
                  <Button>Import XML</Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">GIFT format</h3>
                    <p className="text-sm text-muted-foreground">
                      Import questions from a GIFT format file
                    </p>
                  </div>
                  <Button>Import GIFT</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">Moodle XML format</h3>
                    <p className="text-sm text-muted-foreground">
                      Export questions to a Moodle XML file
                    </p>
                  </div>
                  <Button>Export XML</Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">GIFT format</h3>
                    <p className="text-sm text-muted-foreground">
                      Export questions to a GIFT format file
                    </p>
                  </div>
                  <Button>Export GIFT</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingQuestion(undefined);
        }}
        onSubmit={handleQuestionSubmit}
        initialData={editingQuestion}
      />

      <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateFolderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedFolderForSubfolder && (
        <Dialog
          open={!!selectedFolderForSubfolder}
          onOpenChange={() => setSelectedFolderForSubfolder("")}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subfolder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subfolderName">Subfolder Name</Label>
                <Input
                  id="subfolderName"
                  value={newSubfolderName}
                  onChange={(e) => setNewSubfolderName(e.target.value)}
                  placeholder="Enter subfolder name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFolderForSubfolder("")}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSubfolder}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEditFolderModalOpen} onOpenChange={setIsEditFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={updatedFolderName}
                onChange={(e) => setUpdatedFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditFolderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFolder}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 