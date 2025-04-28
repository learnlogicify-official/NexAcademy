"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, MessageSquare, Download, Award } from "lucide-react"

interface CourseTabsProps {
  children: React.ReactNode
  resources?: React.ReactNode
  assignments?: React.ReactNode
  discussions?: React.ReactNode
  certificate?: React.ReactNode
}

export function CourseTabs({ children, resources, assignments, discussions, certificate }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
      <div className="border-b">
        <TabsList className="h-auto p-0 bg-transparent">
          <TabsTrigger
            value="overview"
            className={`flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary ${
              activeTab === "overview" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="assignments"
            className={`flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary ${
              activeTab === "assignments" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>

          <TabsTrigger
            value="resources"
            className={`flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary ${
              activeTab === "resources" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>

          <TabsTrigger
            value="discussions"
            className={`flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary ${
              activeTab === "discussions" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Discussions</span>
          </TabsTrigger>

          <TabsTrigger
            value="certificate"
            className={`flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary ${
              activeTab === "certificate" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Certificate</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="pt-6">
        {children}
      </TabsContent>

      <TabsContent value="assignments" className="pt-6">
        {assignments || (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assignments Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Assignments for this course will appear here as they are released by the instructor.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="resources" className="pt-6">
        {resources || (
          <div className="text-center py-12">
            <Download className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Resources Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Downloadable resources for this course will appear here as they are released by the instructor.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="discussions" className="pt-6">
        {discussions || (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Discussions Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join the conversation! Be the first to start a discussion about this course.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="certificate" className="pt-6">
        {certificate || (
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Complete the Course to Earn Your Certificate</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Finish all modules and assignments to receive your course completion certificate.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
