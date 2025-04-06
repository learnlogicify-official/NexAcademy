"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, Code, FileText, Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SubmissionModal } from "@/components/submission-modal"

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
  submittedAt?: string
  grade?: {
    score: number
    feedback: string
    xpEarned: number
  }
}

interface AssignmentListProps {
  assignments: Assignment[]
}

export function AssignmentList({ assignments }: AssignmentListProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
            Pending
          </Badge>
        )
      case "submitted":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            Submitted
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500">
            Late
          </Badge>
        )
      case "graded":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            Graded
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getActionButton = (assignment: Assignment) => {
    switch (assignment.status) {
      case "pending":
        return (
          <Button size="sm" className="gap-1">
            {assignment.progress > 0 ? (
              <>
                <Code className="h-4 w-4" /> Continue
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Start
              </>
            )}
          </Button>
        )
      case "submitted":
        return (
          <Button size="sm" variant="outline" className="gap-1">
            <Clock className="h-4 w-4" /> Awaiting Grade
          </Button>
        )
      case "late":
        return (
          <Button size="sm" className="gap-1">
            <FileText className="h-4 w-4" /> Submit Late
          </Button>
        )
      case "graded":
        return (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => {
              setSelectedAssignment(assignment)
              setIsModalOpen(true)
            }}
          >
            <CheckCircle className="h-4 w-4" /> View Result
          </Button>
        )
      default:
        return <Button size="sm">View</Button>
    }
  }

  const getDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const isPast = date < now

    return (
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className={isPast ? "text-red-500" : ""}>
          {isPast ? "Due " : "Due in "}
          {formatDistanceToNow(date, { addSuffix: isPast })}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <Card key={assignment.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <div className="text-sm text-muted-foreground">{assignment.course}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 sm:mt-0">
                      {getStatusBadge(assignment.status)}
                      <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        +{assignment.xpReward} XP
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">{assignment.description}</p>

                  <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      {assignment.status === "pending" || assignment.status === "late" ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{assignment.progress}%</span>
                          </div>
                          <Progress value={assignment.progress} className="h-2 w-full sm:w-32" />
                        </>
                      ) : assignment.status === "graded" ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>
                            Score: {assignment.grade?.score}% (Earned {assignment.grade?.xpEarned} XP)
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {getDueDate(assignment.dueDate)}
                      {getActionButton(assignment)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="text-muted-foreground">No assignments found matching your filters</div>
          <Button
            variant="link"
            onClick={() => {
              // Reset filters logic would go here
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {selectedAssignment && (
        <SubmissionModal assignment={selectedAssignment} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

