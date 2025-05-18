"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SidebarTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sidebar Interaction Test</h1>
      <p className="mb-6 text-gray-600">
        This page is for testing interaction between the sidebar and main content area.
        Try clicking the sidebar items and then interacting with this page.
      </p>
      
      <div className="flex gap-4 mb-8">
        <Link href="/coding-portfolio/dashboard">
          <Button variant="default">Go to Dashboard</Button>
        </Link>
        <Link href="/coding-portfolio/simple">
          <Button variant="outline">Go to Simple Page</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((index) => (
          <div 
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => alert(`Card ${index} clicked!`)}
          >
            <h3 className="font-semibold mb-2">Interactive Card {index}</h3>
            <p className="text-sm text-gray-500">Click me to test interaction</p>
          </div>
        ))}
      </div>
      
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Position near sidebar</h2>
        <p className="mb-4">
          Elements near the sidebar should still be interactive. Try clicking these buttons:
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => alert('Button 1 clicked!')}>Button 1</Button>
          <Button variant="outline" onClick={() => alert('Button 2 clicked!')}>Button 2</Button>
          <Button variant="secondary" onClick={() => alert('Button 3 clicked!')}>Button 3</Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-8">
        If all elements are clickable and the sidebar works properly, the fix was successful.
      </div>
    </div>
  )
} 