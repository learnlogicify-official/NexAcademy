"use client"

import { Button } from "@/components/ui/button"

export function CodeSnippets({ setCode }) {
  const snippets = [
    {
      name: "Two Sum - Hash Map Solution",
      code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null; // No solution found
}`,
    },
    {
      name: "Two Sum - Brute Force",
      code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return null; // No solution found
}`,
    },
    {
      name: "Two Sum - Two Pointers",
      code: `function twoSum(nums, target) {
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
      left++;  numWithIndices[right].index];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return null; // No solution found
}`,
    },
    {
      name: "Hash Map Template",
      code: `function useHashMap(array) {
  const map = new Map();
  
  // Populate the map
  for (let i = 0; i < array.length; i++) {
    map.set(array[i], i);
  }
  
  // Use the map for O(1) lookups
  return map;
}`,
    },
    {
      name: "Binary Search Template",
      code: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
}`,
    },
  ]

  return (
    <div className="grid gap-3">
      {snippets.map((snippet, index) => (
        <div key={index} className="border rounded-lg p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors">
          <h4 className="font-medium mb-2">{snippet.name}</h4>
          <div className="code-snippet bg-slate-100 p-2 rounded-md mb-2 text-xs font-mono overflow-auto max-h-32">
            {snippet.code.split("\n").slice(0, 3).join("\n")}
            {snippet.code.split("\n").length > 3 && "..."}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setCode(snippet.code)}>
            Use This Snippet
          </Button>
        </div>
      ))}
    </div>
  )
}
