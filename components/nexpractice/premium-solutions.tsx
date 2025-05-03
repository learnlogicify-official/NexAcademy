"use client"

import React, { useState } from 'react';
import { 
  Crown, 
  Video, 
  Code, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  BarChart2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge"

export function PremiumSolutions() {
  const [solutionExpanded, setSolutionExpanded] = useState(true);
  const [videoExpanded, setVideoExpanded] = useState(false);
  
  const toggleSolution = () => {
    setSolutionExpanded(!solutionExpanded);
  };
  
  const toggleVideo = () => {
    setVideoExpanded(!videoExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-500" />
          Premium Solutions
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: 2 days ago
          </span>
        </div>
      </div>

      <Tabs defaultValue="solution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solution" className="flex items-center gap-1 justify-start px-0">
            <FileText className="h-4 w-4" />
            Written
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-1 justify-start px-0">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-1 justify-start px-0">
            <BarChart2 className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="solution" className="space-y-4 pt-4">
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="bg-orange-50 border-b border-orange-200 px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={toggleSolution}
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-orange-500" />
                <h3 className="font-medium">Official Solution</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {solutionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {solutionExpanded && (
              <div className="p-4 space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-lg font-semibold">Approach 1: HashMap (One-pass)</h4>
                  <p>
                    To solve this problem efficiently, we can use a HashMap to store the elements we've seen so far along with their indices.
                    For each element, we check if its complement (target - current element) exists in the map. If it does, we've found our solution.
                    If not, we add the current element to the map and continue.
                  </p>
                  
                  <h5 className="font-semibold mt-4">Algorithm:</h5>
                  <ol className="list-decimal list-inside">
                    <li>Create an empty hash map.</li>
                    <li>Iterate through the array elements.</li>
                    <li>For each element, calculate its complement: target - current element.</li>
                    <li>
                      If the complement exists in the hash map, return the indices of the current element and its complement.
                    </li>
                    <li>Otherwise, add the current element and its index to the hash map.</li>
                  </ol>
                
                  <h5 className="font-semibold mt-4">Implementation:</h5>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm">
{`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null; // No solution found
}`}
                  </pre>
                </div>
                
                  <h5 className="font-semibold mt-4">Complexity Analysis:</h5>
                  <ul className="list-disc list-inside">
                    <li>
                      <strong>Time Complexity:</strong> O(n) - We traverse the list containing n elements only once.
                      Each lookup in the hash table costs O(1) time.
                    </li>
                    <li>
                      <strong>Space Complexity:</strong> O(n) - The extra space required depends on the number of items
                      stored in the hash table, which stores at most n elements.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
                
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={toggleVideo}
            >
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Video Solution</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {videoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
                </div>
                
            {videoExpanded && (
              <div className="p-4">
                <div className="bg-muted rounded-md aspect-video flex items-center justify-center">
                  <Button>
                    <Video className="h-5 w-5 mr-2" />
                    Play Video
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Video Length: 8:42 • Instructor: Alex Johnson
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="video" className="pt-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <div className="text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Video solution available for premium members</p>
              <Button className="mt-4">
                <Video className="h-4 w-4 mr-2" />
                Watch Solution
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="community" className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Acceptance Rate</h4>
              <div className="text-2xl font-bold">47.2%</div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: '47.2%' }}></div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Submissions</h4>
              <div className="text-2xl font-bold">14.2M</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                <span>6.7M Accepted</span>
                <span>7.5M Rejected</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Solution Statistics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>HashMap Approach</span>
                  <span className="font-medium">78%</span>
                    </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Brute Force</span>
                  <span className="font-medium">21%</span>
                </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: '21%' }}></div>
                </div>
                  </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Other Approaches</span>
                  <span className="font-medium">1%</span>
                  </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: '1%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
            </div>
  );
}
