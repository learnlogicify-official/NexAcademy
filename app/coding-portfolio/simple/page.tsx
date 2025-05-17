"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function SimpleDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  
  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Simple Dashboard</h1>
        <p className="text-gray-500">Simplified version with fixed tabs and hover issues</p>
      </div>
      
      <div className="mb-4 flex gap-4">
        <Link href="/coding-portfolio/dashboard">
          <Button variant="outline">Go to Full Dashboard</Button>
        </Link>
        <Link href="/coding-portfolio/mini">
          <Button variant="outline">Go to Mini Dashboard</Button>
        </Link>
      </div>
      
      <Card className="border-0 shadow-md">
        <CardHeader>
          <h2 className="text-xl font-semibold">Dashboard Content</h2>
        </CardHeader>
        <CardContent>
          {/* Simple tabs without any decorative elements or overlays */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="border-b border-gray-200 dark:border-gray-800 mb-4">
              <TabsList className="bg-transparent h-12 p-0 w-full justify-start gap-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-2 h-12"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="mt-6 relative z-10">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Overview Content</h3>
                  <p className="mb-4">This tab should be clickable and properly handle hover states.</p>
                  <Button onClick={() => alert("Button clicked in overview tab!")}>
                    Test Button
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6 relative z-10">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Analytics Content</h3>
                  <p className="mb-4">This tab should be clickable and properly handle hover states.</p>
                  <Button onClick={() => alert("Button clicked in analytics tab!")}>
                    Test Button
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6 relative z-10">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Settings Content</h3>
                  <p className="mb-4">This tab should be clickable and properly handle hover states.</p>
                  <Button onClick={() => alert("Button clicked in settings tab!")}>
                    Test Button
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 