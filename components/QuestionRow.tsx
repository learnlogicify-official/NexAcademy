"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface QuestionRowProps {
  id: string;
  name: string;
  type: "CODING" | "MCQ";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  folderName: string;
  version: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export function QuestionRow({
  id,
  name,
  type,
  difficulty,
  status,
  folderName,
  version,
  onEdit,
  onDelete,
  onPreview,
  isSelected,
  onSelect,
}: QuestionRowProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      toast({
        title: "Question deleted",
        description: "The question has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-blue-100 text-blue-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(id, checked as boolean)}
          aria-label="Select row"
        />
      </td>
      <td className="p-4 align-middle font-medium">{name}</td>
      <td className="p-4 align-middle">
        <Badge variant="outline" className="capitalize">
          {type.toLowerCase()}
        </Badge>
      </td>
      <td className="p-4 align-middle">
        <Badge className={cn("capitalize", getDifficultyColor(difficulty))}>
          {difficulty.toLowerCase()}
        </Badge>
      </td>
      <td className="p-4 align-middle">
        <Badge className={cn("capitalize", getStatusColor(status))}>
          {status.toLowerCase()}
        </Badge>
      </td>
      <td className="p-4 align-middle">{folderName}</td>
      <td className="p-4 align-middle">v{version}</td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview(id)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
} 