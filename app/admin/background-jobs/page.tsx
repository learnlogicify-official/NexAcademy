'use client';

import { BackgroundJobsPanel } from "@/components/admin/background-jobs-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BackgroundJobsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Background Jobs</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Background Processing Dashboard</CardTitle>
            <CardDescription>
              Monitor and manage background jobs for statistics calculations and data exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BackgroundJobsPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}