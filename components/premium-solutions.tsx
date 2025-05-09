"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, Video, Code, BookOpen, ChevronDown, ChevronRight, Clock, Cpu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PremiumSolutionsProps {
  setShowPremiumModal?: React.Dispatch<React.SetStateAction<boolean>>
}

export function PremiumSolutions({ setShowPremiumModal }: PremiumSolutionsProps) {
  const [expandedSection, setExpandedSection] = useState<string>("approach1")

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection("")
    } else {
      setExpandedSection(section)
    }
  }

  const handleClose = () => {
    if (setShowPremiumModal) {
      setShowPremiumModal(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-500" />
          Premium Solution
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-200 text-orange-500">Premium Exclusive</Badge>
          {setShowPremiumModal && (
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              &times;
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="editorial">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="editorial" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Editorial
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Solutions (324)
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            Video Solution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editorial" className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Two Sum problem is a classic algorithmic problem and is often used as an introduction to the concept of hash tables.
              Let's explore different approaches to solve this problem.
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer"
              onClick={() => toggleSection("approach1")}
            >
              <div className="flex items-center gap-2">
                {expandedSection === "approach1" ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
                <h3 className="font-medium">Approach 1: Brute Force</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>O(n²)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>O(1)</span>
                </div>
              </div>
            </div>
            
            {expandedSection === "approach1" && (
              <div className="p-4 space-y-4">
                <p className="text-sm">
                  The simplest approach is to use two nested loops. For each element, we check if there's another element that sums up to the target.
                </p>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return null; // No solution found
}`}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Complexity Analysis:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Time Complexity: O(n²) - We have two nested loops, each going through n elements.</li>
                    <li>Space Complexity: O(1) - We only use a constant amount of extra space.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer"
              onClick={() => toggleSection("approach2")}
            >
              <div className="flex items-center gap-2">
                {expandedSection === "approach2" ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
                <h3 className="font-medium">Approach 2: Hash Map (Optimal)</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>O(n)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>O(n)</span>
                </div>
              </div>
            </div>
            
            {expandedSection === "approach2" && (
              <div className="p-4 space-y-4">
                <p className="text-sm">
                  We can use a hash map to store the elements we've seen so far. For each element, we check if its complement (target - current element) exists in the hash map.
                </p>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
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
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Complexity Analysis:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Time Complexity: O(n) - We only need to iterate through the array once.</li>
                    <li>Space Complexity: O(n) - In the worst case, we might need to store all elements in the hash map.</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Interview Tip:</h4>
                  <p className="text-sm text-blue-700">
                    This problem is often used to test your knowledge of hash tables. Be prepared to explain why a hash map is more efficient than the brute force approach, and discuss the trade-offs between time and space complexity.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium Learning Resources
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Video className="h-4 w-4 text-orange-500" />
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Video Walkthrough: Hash Table Implementation
                </a>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Advanced Guide: Two-Pointer Technique
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Code className="h-4 w-4 text-orange-500" />
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Interactive Coding Exercise: Hash Maps
                </a>
              </li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="solutions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Community Solutions</h3>
            <div className="flex items-center gap-2">
              <select className="text-sm border rounded px-2 py-1">
                <option>Most Votes</option>
                <option>Newest</option>
                <option>Fastest Runtime</option>
              </select>
              <select className="text-sm border rounded px-2 py-1">
                <option>All Languages</option>
                <option>JavaScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C++</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <div className="font-medium">User{i}</div>
                      <div className="text-xs text-gray-500">2 months ago</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-200 text-green-600 flex items-center gap-1">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Fastest
                  </Badge>
                </div>
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <pre className="text-sm font-mono whitespace-pre-wrap line-clamp-3">
{`function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in map) return [map[complement], i];
    map[nums[i]] = i;
  }
}`}
                  </pre>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div>Runtime: 52ms (Beats 98%)</div>
                    <div>Memory: 42.1MB (Beats 87%)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7 10V14H10V21H14V14H17L18 10H14V8C14 7.73478 14.1054 7.48043 14.2929 7.29289C14.4804 7.10536 14.7348 7 15 7H18V3H15C13.6739 3 12.4021 3.52678 11.4645 4.46447C10.5268 5.40215 10 6.67392 10 8V10H7Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Share
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="video" className="space-y-4">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-16 w-16 text-white opacity-50 mx-auto" />
              <p className="text-white mt-4">Premium Video Solution</p>
              <p className="text-gray-400 text-sm mt-2">Learn the optimal approach with our expert instructor</p>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-800 mb-2">Video Solution Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Step-by-step visual explanation</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Time and space complexity breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Common mistakes to avoid</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      
      {setShowPremiumModal && (
        <div className="mt-8 flex items-center justify-between border-t pt-4">
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-700"
            onClick={handleClose}
          >
            Not Now
          </Button>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            onClick={handleClose}
          >
            <Crown className="h-4 w-4 mr-2" />
            Subscribe to Premium
          </Button>
        </div>
      )}
    </div>
  )
}
