"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MiniDashboardPage() {
  const [activeTab, setActiveTab] = useState("tab1")
  const [counter, setCounter] = useState(0)
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mini Coding Dashboard</h1>
      
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => setCounter(counter + 1)}>
          Increment: {counter}
        </Button>
        <Link href="/coding-portfolio/dashboard">
          <Button variant="outline">Go to Full Dashboard</Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Tabs Test</h2>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4">
              <p>This is tab 1 content</p>
              <Button className="mt-2" onClick={() => alert('Button in tab 1 clicked')}>
                Click Me
              </Button>
            </TabsContent>
            <TabsContent value="tab2" className="p-4">
              <p>This is tab 2 content</p>
              <Button className="mt-2" onClick={() => alert('Button in tab 2 clicked')}>
                Click Me
              </Button>
            </TabsContent>
            <TabsContent value="tab3" className="p-4">
              <p>This is tab 3 content</p>
              <Button className="mt-2" onClick={() => alert('Button in tab 3 clicked')}>
                Click Me
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent className="p-6">
              <h3 className="font-medium mb-2">Interactive Card {item}</h3>
              <p className="text-sm text-gray-500 mb-4">This is a test card with button.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert(`Card ${item} button clicked!`)}
              >
                Test Button
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 