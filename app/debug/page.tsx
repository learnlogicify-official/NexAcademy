"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function DebugPage() {
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSections = async () => {
    if (!assessmentId) {
      toast.error("Please enter an assessment ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/debug?assessmentId=${assessmentId}`);
      const data = await response.json();
      setResponseData(data);
      toast.success("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const createTestSection = async () => {
    if (!assessmentId) {
      toast.error("Please enter an assessment ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/debug`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assessmentId }),
      });
      const data = await response.json();
      setResponseData(data);
      toast.success("Test section created successfully");
    } catch (error) {
      console.error("Error creating test section:", error);
      toast.error("Failed to create test section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Assessment ID"
            value={assessmentId}
            onChange={(e) => setAssessmentId(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={fetchSections}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Get Sections"}
          </button>
          <button
            onClick={createTestSection}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Creating..." : "Create Test Section"}
          </button>
        </div>
      </div>

      {responseData && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Response Data</h2>
          <div className="bg-white p-4 rounded overflow-auto max-h-[500px]">
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 