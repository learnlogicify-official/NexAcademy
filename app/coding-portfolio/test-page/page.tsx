"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"

export default function TestPage() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Interactive Test Page</h1>
      
      <div className="mb-8">
        <p className="mb-2">Counter: {count}</p>
        <Button onClick={() => setCount(count + 1)} className="mr-2">Increment</Button>
        <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Navigation Test</h2>
        <div className="flex gap-4">
          <Link href="/coding-portfolio/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
      
      <div className="mb-8 border p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Form Test</h2>
        <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Input Test</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md"
              placeholder="Type something..."
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </div>
  )
} 