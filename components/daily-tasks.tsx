"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Star, Trophy, Plus, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type TaskType = "study" | "practice" | "challenge";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  type: TaskType;
  xp: number;
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Complete JavaScript tutorial",
      completed: false,
      type: "study",
      xp: 10,
    },
    {
      id: "2",
      text: "Solve algorithm challenge",
      completed: true,
      type: "challenge",
      xp: 10,
    },
    {
      id: "3",
      text: "Build a small React component",
      completed: false,
      type: "practice",
      xp: 10,
    },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("study");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTask = () => {
    if (newTaskText.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      type: taskType,
      xp: 10, // Fixed XP value for all tasks
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
    setIsDialogOpen(false);
  };

  // Calculate XP with daily limit
  const calculateXP = () => {
    const completedTasksArray = tasks.filter((t) => t.completed);
    const countedTasks = completedTasksArray.slice(0, 5); // Only count first 5 completed tasks
    const totalXpEarned = countedTasks.length * 10;
    const maxPossibleXp = Math.min(tasks.length, 5) * 10; // Max 5 tasks count for XP

    return {
      completedCount: completedTasksArray.length,
      countedForXP: countedTasks.length,
      earnedXP: totalXpEarned,
      maxPossibleXP: maxPossibleXp,
    };
  };

  const xpStats = calculateXP();

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case "study":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "practice":
        return <Star className="h-4 w-4 text-amber-500" />;
      case "challenge":
        return <Trophy className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTaskTypeClass = (type: TaskType) => {
    switch (type) {
      case "study":
        return "bg-blue-500/10 text-blue-500";
      case "practice":
        return "bg-amber-500/10 text-amber-500";
      case "challenge":
        return "bg-purple-500/10 text-purple-500";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Daily To-Do List</CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="flex items-center gap-1 h-7 px-2 text-xs mr-1"
          >
            <Plus className="h-3 w-3" />
            <span>Add Task</span>
          </Button>
        </div>
        {tasks.length > 0 && (
          <CardDescription className="text-xs mt-1">
            Daily limit: 5 tasks counted for XP (max 50 XP per day)
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Task add dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-name">Task description</Label>
                <Input
                  id="task-name"
                  placeholder="Enter your task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label>Task type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={taskType === "study" ? "default" : "outline"}
                    onClick={() => setTaskType("study")}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Study</span>
                  </Button>
                  <Button
                    type="button"
                    variant={taskType === "practice" ? "default" : "outline"}
                    onClick={() => setTaskType("practice")}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Practice</span>
                  </Button>
                  <Button
                    type="button"
                    variant={taskType === "challenge" ? "default" : "outline"}
                    onClick={() => setTaskType("challenge")}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Challenge</span>
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={addTask} disabled={!newTaskText.trim()}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-2 flex-1">
          <AnimatePresence initial={false}>
            {tasks
              .slice()
              .sort((a, b) => {
                // Sort by completion status (incomplete first)
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }
                // If same completion status, sort by XP (higher XP first)
                return b.xp - a.xp;
              })
              .map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-6 h-6 rounded-full ${
                          task.completed
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "border"
                        }`}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </Button>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.text}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="flex items-center">
                            {getTaskTypeIcon(task.type)}
                            <span className="text-xs text-muted-foreground ml-1">
                              {task.type.charAt(0).toUpperCase() +
                                task.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${getTaskTypeClass(
                          task.type
                        )} min-w-[60px] flex items-center justify-center`}
                      >
                        +10 XP
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTask(task.id)}
                        className="w-6 h-6 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-6 text-muted-foreground flex-1 flex items-center justify-center">
            <p>No tasks for today. Add some tasks to get started!</p>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex justify-between items-center mb-2">
            <Badge className="bg-primary/10 text-primary min-w-[90px] flex items-center justify-center whitespace-nowrap">
              +{xpStats.earnedXP}/{xpStats.maxPossibleXP} XP
            </Badge>
            <div className="text-xs text-muted-foreground">
              {xpStats.completedCount}/{tasks.length} Completed
              {xpStats.completedCount > 5 &&
                ` (${xpStats.countedForXP} counted for XP)`}
            </div>
          </div>
          <Progress
            value={(xpStats.completedCount / Math.max(1, tasks.length)) * 100}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
