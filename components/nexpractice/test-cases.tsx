"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TestCases() {
  const [activeCase, setActiveCase] = useState(1)
  const [numsInput, setNumsInput] = useState("[2,7,11,15]")
  const [targetInput, setTargetInput] = useState("9")

  return (
    <div className="space-y-4">
      <Tabs defaultValue="case1" className="w-full">
        <TabsList className="flex bg-gray-100 p-1 rounded-md">
          <TabsTrigger
            value="case1"
            className={`flex-1 rounded-md text-xs py-1 ${activeCase === 1 ? "bg-white shadow" : "bg-transparent"}`}
            onClick={() => setActiveCase(1)}
          >
            Case 1
          </TabsTrigger>
          <TabsTrigger
            value="case2"
            className={`flex-1 rounded-md text-xs py-1 ${activeCase === 2 ? "bg-white shadow" : "bg-transparent"}`}
            onClick={() => setActiveCase(2)}
          >
            Case 2
          </TabsTrigger>
          <TabsTrigger
            value="case3"
            className={`flex-1 rounded-md text-xs py-1 ${activeCase === 3 ? "bg-white shadow" : "bg-transparent"}`}
            onClick={() => setActiveCase(3)}
          >
            Case 3
          </TabsTrigger>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-md">
            +
          </Button>
        </TabsList>

        <TabsContent value="case1" className="mt-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">nums =</div>
              <input
                type="text"
                value={numsInput}
                onChange={(e) => setNumsInput(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">target =</div>
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="case2" className="mt-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">nums =</div>
              <input
                type="text"
                value="[3,2,4]"
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">target =</div>
              <input
                type="text"
                value="6"
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="case3" className="mt-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">nums =</div>
              <input
                type="text"
                value="[3,3]"
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">target =</div>
              <input
                type="text"
                value="6"
                className="w-full p-2 border rounded-md bg-gray-50 font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
