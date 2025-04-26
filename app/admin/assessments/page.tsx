"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ChevronDown, ChevronUp, Clock, Users, CheckCircle, XCircle, AlertCircle, PlusCircle, Settings, Award, User, Edit, FileText, Calendar, Timer, Shield } from "lucide-react";
import { toast } from "sonner";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Assessment {
  id: string;
  name: string;
  description: string;
  status: string;
  totalMarks: number;
  passingMarks: number;
  startDate: string;
  endDate: string;
  duration: number;
  timeBoundEnabled: boolean;
  timeLimitEnabled: boolean;
  attemptsAllowed: number;
  unlimitedAttempts: boolean;
  proctoring: boolean;
  disableRightClick: boolean;
  disableCopyPaste: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  folder: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AssessmentStats {
  total: number;
  draft: number;
  ready: number;
  published: number;
  archived: number;
  active: number;
  upcoming: number;
  completed: number;
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stats, setStats] = useState<AssessmentStats>({
    total: 0,
    draft: 0,
    ready: 0,
    published: 0,
    archived: 0,
    active: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/assessments");
      if (!response.ok) {
        throw new Error("Failed to fetch assessments");
      }
      const data = await response.json();
      setAssessments(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Assessment[]) => {
    const now = new Date();
    const stats = {
      total: data.length,
      draft: 0,
      ready: 0,
      published: 0,
      archived: 0,
      active: 0,
      upcoming: 0,
      completed: 0,
    };

    data.forEach(assessment => {
      // Count by status
      stats[assessment.status.toLowerCase() as keyof AssessmentStats]++;

      // Count by time status
      if (assessment.timeBoundEnabled) {
        const startDate = new Date(assessment.startDate);
        const endDate = new Date(assessment.endDate);

        if (now < startDate) {
          stats.upcoming++;
        } else if (now > endDate) {
          stats.completed++;
        } else {
          stats.active++;
        }
      }
    });

    setStats(stats);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-500", text: "Draft" },
      READY: { color: "bg-blue-500", text: "Ready" },
      PUBLISHED: { color: "bg-green-500", text: "Published" },
      ARCHIVED: { color: "bg-red-500", text: "Archived" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status };
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const getTimeStatusBadge = (assessment: Assessment) => {
    if (!assessment.timeBoundEnabled) {
      return <Badge className="bg-gray-500 text-white">No Time Bound</Badge>;
    }

    const now = new Date();
    const startDate = new Date(assessment.startDate);
    const endDate = new Date(assessment.endDate);

    if (now < startDate) {
      return <Badge className="bg-yellow-500 text-white">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge className="bg-red-500 text-white">Completed</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddQuestions = (e: React.MouseEvent, assessmentId: string) => {
    e.stopPropagation(); // Prevent row click event
    router.push(`/admin/assessments/${assessmentId}/questions`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <Button onClick={() => router.push("/admin/assessments/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.upcoming} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ready} ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              {stats.archived} archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcoming} upcoming, {stats.completed} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilter ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("READY")}>
              Ready
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("PUBLISHED")}>
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("ARCHIVED")}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>
            Manage and monitor all your assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Status</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow 
                    key={assessment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/assessments/${assessment.id}`)}
                  >
                    <TableCell className="font-medium">{assessment.name}</TableCell>
                    <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                    <TableCell>{getTimeStatusBadge(assessment)}</TableCell>
                    <TableCell>
                      {assessment.passingMarks}/{assessment.totalMarks}
                    </TableCell>
                    <TableCell>
                      {assessment.timeLimitEnabled ? `${assessment.duration} min` : "No limit"}
                    </TableCell>
                    <TableCell>{assessment.createdBy.name}</TableCell>
                    <TableCell>
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={(e) => handleAddQuestions(e, assessment.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Questions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 