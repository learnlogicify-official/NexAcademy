"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ResultPanel } from "./result-panel";
import { Judge0StatusCode, getVerdict } from '@/utils/judge0-status';

// Mock results for testing UI rendering
const createMockResults = (verdict: string, statusId: number) => {
  return {
    success: true,
    loading: false,
    mode: "run" as const,
    judgeResults: [
      {
        input: "Sample input",
        expected: "Expected output",
        output: "Your output would appear here",
        stderr: verdict === "Runtime Error" ? "Some error output" : null,
        compile_output: verdict === "Compilation Error" ? "Some compile error" : null,
        status: { id: statusId, description: verdict },
        verdict: verdict,
        time: "0.1",
        memory: "10000",
        isCorrect: verdict === "Accepted",
        isSkipped: false
      }
    ]
  };
};

export default function TimeExceededTest() {
  const [activeVerdict, setActiveVerdict] = useState("Time Limit Exceeded");
  
  // Create a mapping of verdict names to their status IDs
  const verdictOptions = [
    { name: "Accepted", statusId: Judge0StatusCode.ACCEPTED },
    { name: "Wrong Answer", statusId: Judge0StatusCode.WRONG_ANSWER },
    { name: "Time Limit Exceeded", statusId: Judge0StatusCode.TIME_LIMIT_EXCEEDED },
    { name: "Compilation Error", statusId: Judge0StatusCode.COMPILATION_ERROR },
    { name: "Runtime Error", statusId: Judge0StatusCode.RUNTIME_ERROR_OTHER },
    { name: "Memory Limit Exceeded", statusId: 0 } // Not a standard Judge0 status
  ];
  
  // Find the selected verdict's status ID
  const selectedVerdictInfo = verdictOptions.find(v => v.name === activeVerdict) || verdictOptions[0];
  
  // Create mock results based on the selected verdict
  const mockResults = createMockResults(selectedVerdictInfo.name, selectedVerdictInfo.statusId);
  
  // Add useEffect to log when rendering with Time Limit Exceeded
  useEffect(() => {
    if (activeVerdict === "Time Limit Exceeded") {
      console.log("Rendering Time Limit Exceeded test with status ID:", Judge0StatusCode.TIME_LIMIT_EXCEEDED);
      console.log("getVerdict result:", getVerdict(Judge0StatusCode.TIME_LIMIT_EXCEEDED));
    }
  }, [activeVerdict]);
  
  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-3">Verdict Renderer Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select different verdict types to see how they're rendered in the UI.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {verdictOptions.map(option => (
            <Button 
              key={option.name}
              variant={activeVerdict === option.name ? "default" : "outline"}
              onClick={() => setActiveVerdict(option.name)}
              size="sm"
            >
              {option.name}
            </Button>
          ))}
        </div>
        
        <div className="text-sm bg-gray-50 p-2 border rounded mb-4">
          <p><strong>Selected Verdict:</strong> {activeVerdict}</p>
          <p><strong>Status ID:</strong> {selectedVerdictInfo.statusId}</p>
          <p><strong>Verdict from ID:</strong> {getVerdict(selectedVerdictInfo.statusId)}</p>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <div className="bg-gray-50 p-2 px-4 border-b">
          <h3 className="font-medium">Result Panel Preview</h3>
        </div>
        <ResultPanel results={mockResults} />
      </div>
    </div>
  );
} 