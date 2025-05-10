'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, BarChart, PieChart, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StatsProps {
  selectedFolder: string | null;
  pendingFilters: any;
  onStatsLoaded: (stats: any) => void;
}

export function StatsPanel({ selectedFolder, pendingFilters, onStatsLoaded }: StatsProps) {
  const { toast } = useToast();
  const [statsJobId, setStatsJobId] = useState<string | null>(null);
  const [statsJobStatus, setStatsJobStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [statsData, setStatsData] = useState<any>(null);
  
  // Function to trigger background statistics calculation
  const calculateStatsInBackground = async () => {
    try {
      setStatsJobStatus('processing');
      
      // Prepare query parameters for stats calculation
      const params: any = {};
      
      if (pendingFilters.subcategory !== 'all') {
        params.folderId = pendingFilters.subcategory;
      } else if (pendingFilters.category !== 'all') {
        params.folderId = pendingFilters.category;
      } else if (selectedFolder) {
        params.folderId = selectedFolder;
      }
      
      params.includeSubfolders = pendingFilters.includeSubcategories || false;
      
      // Create a background job
      const response = await fetch('/api/admin/background-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobType: 'calculate-stats',
          params
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to start background job');
      }
      
      // Store the request ID
      setStatsJobId(result.requestId);
      
      // Poll for job completion
      pollJobStatus(result.requestId);
    } catch (error) {
      console.error('Error starting background stats calculation:', error);
      setStatsJobStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to calculate statistics. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Function to poll job status
  const pollJobStatus = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/background-jobs/${requestId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check job status');
      }
      
      if (result.status === 'completed') {
        // Job completed successfully
        setStatsJobStatus('completed');
        setStatsData(result.data);
        onStatsLoaded(result.data);
      } else if (result.status === 'error') {
        // Job failed
        setStatsJobStatus('error');
        toast({
          title: 'Error',
          description: 'Failed to calculate statistics. Please try again.',
          variant: 'destructive'
        });
      } else {
        // Job still processing, poll again after a delay
        setTimeout(() => pollJobStatus(requestId), 2000);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      setStatsJobStatus('error');
    }
  };
  
  // Update the fetchStats function to use background processing
  const fetchStats = () => {
    if (statsJobStatus === 'processing') {
      // Already processing, don't start another job
      return;
    }
    
    calculateStatsInBackground();
  };
  
  // Fetch stats when filters change
  useEffect(() => {
    if (statsJobStatus !== 'processing') {
      fetchStats();
    }
  }, [selectedFolder, pendingFilters]);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Question Statistics</CardTitle>
            <CardDescription>Real-time analytics of your question bank</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats} 
            disabled={statsJobStatus === 'processing'}
          >
            {statsJobStatus === 'processing' ? 
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> : 
              <RefreshCw className="h-4 w-4 mr-1" />
            }
            Refresh Stats
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {statsJobStatus === 'processing' && !statsData ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Calculating statistics...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a moment for large question banks</p>
          </div>
        ) : statsJobStatus === 'error' ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-red-500">Failed to load statistics</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : statsData ? (
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary"><BarChart className="h-4 w-4 mr-1" /> Summary</TabsTrigger>
              <TabsTrigger value="distribution"><PieChart className="h-4 w-4 mr-1" /> Distribution</TabsTrigger>
              <TabsTrigger value="details"><ListChecks className="h-4 w-4 mr-1" /> Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-1">Total Questions</p>
                  <p className="text-3xl font-bold">{statsData.summary.total}</p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-1">By Type</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Multiple Choice</span>
                      <Badge variant="outline">{statsData.summary.byType.MCQ || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coding</span>
                      <Badge variant="outline">{statsData.summary.byType.CODING || 0}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-muted-foreground text-sm mb-1">By Status</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ready</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {statsData.summary.byStatus.READY || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Draft</span>
                      <Badge variant="outline">{statsData.summary.byStatus.DRAFT || 0}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm mb-3">By Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Easy</span>
                    <span className="text-xl font-semibold text-green-700">
                      {statsData.summary.byDifficulty.EASY || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Medium</span>
                    <span className="text-xl font-semibold text-yellow-700">
                      {statsData.summary.byDifficulty.MEDIUM || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-xs text-muted-foreground mb-1">Hard</span>
                    <span className="text-xl font-semibold text-red-700">
                      {statsData.summary.byDifficulty.HARD || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground text-right">
                Calculated {new Date(statsData.meta.calculatedAt).toLocaleString()} 
                in {statsData.meta.processingTimeMs}ms
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="mt-0">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm mb-3">Distribution by Folder</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {statsData.distribution.byFolder.map((folder: any) => (
                    <div key={folder.folderId || 'unknown'} className="flex justify-between items-center">
                      <span className="text-sm truncate max-w-[70%]">
                        {folder.folderName || 'Uncategorized'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full" 
                            style={{ width: `${(folder.count / statsData.summary.total) * 100}%` }}
                          />
                        </div>
                        <Badge variant="outline">{folder.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-0">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground text-sm mb-3">Detailed Statistics</p>
                <pre className="text-xs overflow-auto max-h-64 bg-card p-2 rounded">
                  {JSON.stringify(statsData, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No statistics available</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchStats}
              className="mt-2"
            >
              Calculate Statistics
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}