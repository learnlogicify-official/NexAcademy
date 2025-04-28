"use client"

import { useState } from "react"
import { BookOpen, MessageSquare, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseTabsNavigationProps {
  onTabChange?: (tab: string) => void
}

export function CourseTabsNavigation({ onTabChange }: CourseTabsNavigationProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
    },
    {
      id: "discussions",
      label: "Discussions",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
    },
    {
      id: "certificate",
      label: "Certificate",
      icon: <Award className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <div className="border-b border-border">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center px-4 py-3 font-medium text-sm transition-colors relative",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  )
}
