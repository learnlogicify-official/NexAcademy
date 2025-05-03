"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"

export function ApproachGuide() {
  const [expandedSection, setExpandedSection] = useState("bruteForce")

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection("")
    } else {
      setExpandedSection(section)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Solution Approaches</h2>
        <p className="text-sm text-muted-foreground">
          There are multiple ways to solve this problem. Here are the most common approaches with their time and space
          complexity analysis.
        </p>
      </div>

      <div className="approach-card">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("bruteForce")}>
          <div className="flex items-center gap-2">
            {expandedSection === "bruteForce" ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-medium">Approach 1: Brute Force</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="complexity-tag time-complexity">Time: O(n²)</span>
            <span className="complexity-tag space-complexity">Space: O(1)</span>
          </div>
        </div>

        {expandedSection === "bruteForce" && (
          <div className="mt-3 pl-7 space-y-3">
            <p className="text-sm">
              The simplest approach is to use two nested loops. For each element, we check if there's another element
              that sums up to the target.
            </p>

            <div className="bg-slate-50 rounded-lg p-3 border">
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
              <h4 className="text-sm font-medium">Analysis:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Time Complexity: O(n²) because we have two nested loops</li>
                <li>Space Complexity: O(1) as we only use a constant amount of extra space</li>
                <li>Simple to implement but inefficient for large inputs</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="approach-card">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("hashMap")}>
          <div className="flex items-center gap-2">
            {expandedSection === "hashMap" ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-medium">Approach 2: Hash Map (Optimal)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="complexity-tag time-complexity">Time: O(n)</span>
            <span className="complexity-tag space-complexity">Space: O(n)</span>
          </div>
        </div>

        {expandedSection === "hashMap" && (
          <div className="mt-3 pl-7 space-y-3">
            <p className="text-sm">
              We can use a hash map to store the elements we've seen so far. For each element, we check if its
              complement (target - current element) exists in the hash map.
            </p>

            <div className="bg-slate-50 rounded-lg p-3 border">
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
              <h4 className="text-sm font-medium">Analysis:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Time Complexity: O(n) as we only need to iterate through the array once</li>
                <li>Space Complexity: O(n) for storing elements in the hash map</li>
                <li>Much more efficient than the brute force approach</li>
                <li>This is the recommended approach for interviews</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="approach-card">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("twoPointers")}>
          <div className="flex items-center gap-2">
            {expandedSection === "twoPointers" ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-medium">Approach 3: Two Pointers (Sorted Array)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="complexity-tag time-complexity">Time: O(n log n)</span>
            <span className="complexity-tag space-complexity">Space: O(n)</span>
          </div>
        </div>

        {expandedSection === "twoPointers" && (
          <div className="mt-3 pl-7 space-y-3">
            <p className="text-sm">
              If the array is sorted, we can use two pointers (one from the beginning, one from the end) to find the
              pair. Note that this approach requires extra work to track the original indices.
            </p>

            <div className="bg-slate-50 rounded-lg p-3 border">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {`function twoSum(nums, target) {
  // Create a copy with original indices
  const numWithIndices = nums.map((num, index) => ({ num, index }));
  
  // Sort by value
  numWithIndices.sort((a, b) => a.num - b.num);
  
  let left = 0;
  let right = numWithIndices.length - 1;
  
  while (left < right) {
    const sum = numWithIndices[left].num + numWithIndices[right].num;
    
    if (sum === target) {
      return [numWithIndices[left].index, numWithIndices[right].index];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return null; // No solution found
}`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Analysis:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Time Complexity: O(n log n) due to the sorting operation</li>
                <li>Space Complexity: O(n) for the auxiliary array with indices</li>
                <li>Less efficient than the hash map approach for this problem</li>
                <li>More useful when the array is already sorted</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">Learning Resources</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Hash Table Data Structure Explained
            </a>
          </li>
          <li className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Two Pointers Technique Tutorial
            </a>
          </li>
          <li className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Time & Space Complexity Analysis
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
