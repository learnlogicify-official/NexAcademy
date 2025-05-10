'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Clock, Play, Trash } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  type: 'statistics' | 'data-export';
  status: 'waiting' | 'active' | 'completed' | 'failed';
  createdAt: string;
  finishedAt: string | null;
  data: any;
  error: string | null;
}

export function BackgroundJobsPanel() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/background-jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load background jobs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchJobs();
    // Set up polling for active jobs
    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(job => job.status === 'active' || job.status === 'waiting');
      if (hasActiveJobs) {
        fetchJobs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [jobs]);
  
  const filteredJobs = activeTab === 'all' 
    ? jobs 
    : jobs.filter(job => {
        if (activeTab === 'active') return job.status === 'active' || job.status === 'waiting';
        return job.status === activeTab;
      });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Play className="h-3 w-3 mr-1" /> Running</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Waiting</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case 'statistics':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Statistics</Badge>;
      case 'data-export':
        return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">Data Export</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Background Jobs</CardTitle>
            <CardDescription>Monitor and manage background processing tasks</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchJobs} 
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading && jobs.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {activeTab !== 'all' ? activeTab : ''} jobs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getJobTypeBadge(job.type)}
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Job ID: {job.id}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Created</p>
                        <p className="font-medium">{format(new Date(job.createdAt), 'PPpp')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {job.finishedAt && (
                        <div>
                          <p className="text-muted-foreground mb-1">Completed</p>
                          <p className="font-medium">{format(new Date(job.finishedAt), 'PPpp')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(job.finishedAt), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {job.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <p className="font-semibold mb-1">Error:</p>
                        <p>{job.error}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-sm">
                      <p className="text-muted-foreground mb-1">Parameters</p>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(job.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
        <p>Showing {filteredJobs.length} of {jobs.length} jobs</p>
      </CardFooter>
    </Card>
  );
}