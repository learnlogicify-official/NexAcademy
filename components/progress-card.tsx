"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

interface ProgressItem {
  name: string
  current: number
  max: number
  color: string
}

interface ProgressCardProps {
  items: ProgressItem[]
  className?: string
}

export function ProgressCard({ items, className }: ProgressCardProps) {
  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-rose-500" />
          Progress Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-6">
          {items.map((item, index) => {
            const percentage = Math.round((item.current / item.max) * 100)

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="text-sm text-gray-400">
                    {item.current} / {item.max} ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" indicatorClassName={`${item.color}`} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{item.max}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
