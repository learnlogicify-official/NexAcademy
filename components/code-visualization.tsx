"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CodeVisualization() {
  const [currentStep, setCurrentStep] = useState(0)
  const [expanded, setExpanded] = useState(true)

  const steps = [
    {
      title: "Initialize",
      description: "Create a hash map to store values and their indices",
      code: "const map = new Map()",
      visualization: (
        <div className="flex items-center justify-center p-2">
          <div className="border rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Map</div>
            <div className="text-sm">{}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Iterate through array",
      description: "For each element, calculate the complement needed to reach target",
      code: "for (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i]",
      visualization: (
        <div className="flex items-center justify-center p-2">
          <div className="flex gap-2">
            {[2, 7, 11, 15].map((num, idx) => (
              <div
                key={idx}
                className={`border rounded p-2 text-center ${idx === 0 ? "bg-primary/20 border-primary" : ""}`}
              >
                <div className="text-xs text-muted-foreground">nums[{idx}]</div>
                <div className="text-sm">{num}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Check for complement",
      description: "Check if the complement exists in our map",
      code: "  if (map.has(complement)) {\n    return [map.get(complement), i];\n  }",
      visualization: (
        <div className="flex flex-col items-center justify-center p-2 gap-2">
          <div className="border rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Map</div>
            <div className="text-sm">{}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">complement = 9 - 2 = 7</div>
            <div className="text-sm font-medium text-amber-600">Not in map yet</div>
          </div>
        </div>
      ),
    },
    {
      title: "Store current value",
      description: "Add the current value and its index to the map",
      code: "  map.set(nums[i], i);\n}",
      visualization: (
        <div className="flex flex-col items-center justify-center p-2 gap-2">
          <div className="border rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Map</div>
            <div className="text-sm">{`{ 2 => 0 }`}</div>
          </div>
          <div className="text-sm">Added nums[0] = 2 with index 0 to map</div>
        </div>
      ),
    },
    {
      title: "Continue iteration",
      description: "Move to the next element (7) and calculate its complement",
      code: "// Next iteration\nconst complement = target - nums[1] // 9 - 7 = 2",
      visualization: (
        <div className="flex flex-col items-center justify-center p-2 gap-2">
          <div className="flex gap-2">
            {[2, 7, 11, 15].map((num, idx) => (
              <div
                key={idx}
                className={`border rounded p-2 text-center ${idx === 1 ? "bg-primary/20 border-primary" : ""}`}
              >
                <div className="text-xs text-muted-foreground">nums[{idx}]</div>
                <div className="text-sm">{num}</div>
              </div>
            ))}
          </div>
          <div className="text-sm">complement = 9 - 7 = 2</div>
        </div>
      ),
    },
    {
      title: "Find match",
      description: "The complement (2) exists in our map at index 0",
      code: "if (map.has(complement)) { // true\n  return [map.get(complement), i]; // [0, 1]\n}",
      visualization: (
        <div className="flex flex-col items-center justify-center p-2 gap-2">
          <div className="border rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Map</div>
            <div className="text-sm">{`{ 2: 0 }`}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">complement = 2</div>
            <div className="text-sm font-medium text-green-600">Found in map at index 0!</div>
          </div>
          <div className="text-sm font-medium mt-2">Return [0, 1]</div>
        </div>
      ),
    },
  ]

  return (
    <div className="code-visualization">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 p-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium">Algorithm Visualization</span>
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <span className="text-sm mx-2">
            {currentStep + 1}/{steps.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border rounded-lg p-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              {currentStep + 1}
            </div>
            <h3 className="font-medium">{steps[currentStep].title}</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{steps[currentStep].description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground mb-1">Code</div>
              <pre className="text-sm font-mono whitespace-pre-wrap">{steps[currentStep].code}</pre>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border">
              <div className="text-xs text-muted-foreground mb-1">Visualization</div>
              {steps[currentStep].visualization}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
