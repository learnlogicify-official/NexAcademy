"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"

interface Assignment {
  id: number
  title: string
  course: string
  courseId: number
  dueDate: string
  xpReward: number
  status: string
  description: string
  progress: number
}

interface AssignmentCalendarProps {
  assignments: Assignment[]
}

export function AssignmentCalendar({ assignments }: AssignmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const getAssignmentsForDay = (day: Date) => {
    return assignments.filter((assignment) => isSameDay(new Date(assignment.dueDate), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/10 text-blue-500"
      case "submitted":
        return "bg-yellow-500/10 text-yellow-500"
      case "late":
        return "bg-red-500/10 text-red-500"
      case "graded":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-sm font-medium">
              {day}
            </div>
          ))}

          {daysInMonth.map((day, i) => {
            const dayAssignments = getAssignmentsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <div key={i} className={`min-h-24 rounded-md border p-1 ${isCurrentMonth ? "" : "opacity-40"}`}>
                <div className="text-right text-sm">{format(day, "d")}</div>
                <div className="mt-1 space-y-1">
                  {dayAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`rounded px-1 py-0.5 text-xs ${getStatusColor(assignment.status)}`}
                      title={`${assignment.title} - ${assignment.course}`}
                    >
                      <div className="truncate">{assignment.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

