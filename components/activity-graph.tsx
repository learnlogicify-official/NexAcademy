"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Clock } from "lucide-react"
import { format, parseISO } from "date-fns"

interface ActivityData {
  day: string
  hours: number
}

interface ActivityGraphProps {
  activityData: ActivityData[]
}

export function ActivityGraph({ activityData }: ActivityGraphProps) {
  // Format data for the chart
  const formattedData = activityData.map((item) => ({
    ...item,
    date: format(parseISO(item.day), "MMM dd"),
  }))

  // Calculate total hours
  const totalHours = activityData.reduce((sum, item) => sum + item.hours, 0)

  // Calculate active days
  const activeDays = activityData.filter((item) => item.hours > 0).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Coding Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm text-muted-foreground">Active Days</p>
            <p className="text-2xl font-bold">
              {activeDays} / {activityData.length}
            </p>
          </div>
        </div>

        <div className="h-64">
          <ChartContainer
            tooltip={
              <ChartTooltip>
                <ChartTooltipContent
                  content={({ payload }) => {
                    if (!payload?.length) return null
                    const { day, hours } = payload[0].payload
                    return (
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">{format(parseISO(day), "MMM d, yyyy")}</p>
                        <p className="font-bold">{hours} hours</p>
                      </div>
                    )
                  }}
                />
              </ChartTooltip>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

