"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Award, Lock, MoreVertical, Pin, Trash2, Star } from "lucide-react"
import { getCourseTheme } from "@/lib/course-icons"
import { cn } from "@/lib/utils"

interface CourseBase {
  id: string | number
  title: string
  tags?: string[]
  progress?: number
  status?: string
  image?: string
}

interface CourseDetailed extends CourseBase {
  description: string
  instructor: string
  level: string
  duration: string
  enrolled: number
  rating: number
}

interface CourseEnrolled extends CourseBase {
  instructor: string
  earnedXP?: number
  totalXP?: number
  difficulty?: string
  lockReason?: string
  badge?: {
    name: string
    description: string
    icon: string
  } | null
  level?: {
    number: number
    title: string
  } | null
}

type Course = CourseDetailed | CourseEnrolled

interface CourseCardProps {
  course: Course
  viewMode?: "grid" | "list" | "compact"
  showActions?: boolean
}

export function CourseCard({ course, viewMode = "grid", showActions = false }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  // Get the appropriate theme (icon and colors) based on course title and tags
  const theme = getCourseTheme(course.title, course.tags || [])
  const Icon = theme.icon

  // Determine if this is a detailed course or an enrolled course
  const isDetailed = "description" in course && "rating" in course
  const isEnrolled = "earnedXP" in course || (course.progress && course.progress > 0)
  const isLocked = course.status === "locked"

  // Handle link URL
  const linkUrl = typeof course.id === "number" ? `/courses/${course.id}` : `/courses/${course.id}`

  // Compact view for dashboard
  if (viewMode === "compact") {
    return (
      <Link href={linkUrl}>
        <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
          <div className={cn("relative aspect-video w-full overflow-hidden", theme.bgColor)}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Icon className={cn("h-32 w-32", theme.color)} />
            </div>
            <div className="absolute top-2 left-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  theme.bgColor.replace("/10", "/30"),
                )}
              >
                <Icon className={cn("h-4 w-4", theme.color)} />
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-1 font-semibold">{course.title}</h3>
            {course.progress !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <Progress value={course.progress} className="h-2" />
                <span className="text-xs font-medium">{course.progress}%</span>
              </div>
            )}
            <Button size="sm" className="mt-4 w-full" variant={course.progress === 100 ? "outline" : "default"}>
              {course.progress === 100 ? "Completed" : "Continue"}
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  // List view
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          <div className={cn("relative h-24 w-full sm:h-auto sm:w-32", theme.bgColor, isLocked ? "opacity-50" : "")}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Icon className={cn("h-16 w-16", theme.color)} />
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{course.instructor}</span>
                  {isDetailed && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className={theme.bgColor}>
                        {(course as CourseDetailed).level}
                      </Badge>
                    </>
                  )}
                  {!isDetailed && "difficulty" in course && course.difficulty && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className={theme.bgColor}>
                        {course.difficulty}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsPinned(!isPinned)}>
                      <Pin className="mr-2 h-4 w-4" />
                      {isPinned ? "Unpin course" : "Pin course"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Leave course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isDetailed && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {(course as CourseDetailed).description}
              </p>
            )}

            <div className="mt-auto space-y-2">
              {!isLocked && course.progress !== undefined ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  {isEnrolled && "earnedXP" in course && "totalXP" in course && (
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        XP: {course.earnedXP}/{course.totalXP}
                      </span>
                      {course.level && (
                        <Badge variant="outline" className="ml-auto">
                          Level {course.level.number}: {course.level.title}
                        </Badge>
                      )}
                    </div>
                  )}
                </>
              ) : (
                isLocked &&
                "lockReason" in course && <div className="text-sm text-muted-foreground">{course.lockReason}</div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              {course.status === "completed" || course.progress === 100 ? (
                <Badge className="gap-1 bg-green-500 text-white">
                  <Award className="h-3 w-3" /> Completed
                </Badge>
              ) : isLocked ? (
                <Button disabled className="w-full">
                  Locked
                </Button>
              ) : (
                <Button className="w-full">Continue</Button>
              )}

              {"badge" in course && course.badge && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                        <span>{course.badge.icon}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{course.badge.name}</p>
                      <p className="text-xs text-muted-foreground">{course.badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Default grid view
  return (
    <Link href={linkUrl}>
      <Card
        className={cn("h-full overflow-hidden transition-all", isHovered ? "shadow-md" : "")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "relative h-24 w-full overflow-hidden transition-all",
            theme.bgColor,
            isHovered ? `${theme.bgColor.replace("/10", "/20")}` : "",
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Icon className={cn("h-32 w-32", theme.color)} />
          </div>
          <div className="absolute top-4 left-4 flex items-center">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                theme.bgColor.replace("/10", "/30"),
              )}
            >
              <Icon className={cn("h-6 w-6", theme.color)} />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-lg line-clamp-1 text-foreground">{course.title}</h3>
            </div>
          </div>
        </div>
        <CardHeader className="p-4 pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">{course.instructor}</p>
            </div>
            {isDetailed && (
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{(course as CourseDetailed).rating}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isDetailed && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{(course as CourseDetailed).description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {isDetailed ? (
              <>
                <Badge variant="outline">{(course as CourseDetailed).level}</Badge>
                <Badge variant="outline">{(course as CourseDetailed).duration}</Badge>
              </>
            ) : (
              "difficulty" in course && course.difficulty && <Badge variant="outline">{course.difficulty}</Badge>
            )}

            {course.tags &&
              course.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>

          {course.progress !== undefined && course.progress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {isDetailed ? (
            <div className="text-sm text-muted-foreground">
              {(course as CourseDetailed).enrolled.toLocaleString()} students enrolled
            </div>
          ) : (
            isEnrolled &&
            "earnedXP" in course &&
            "totalXP" in course && (
              <div className="text-sm text-muted-foreground">
                XP: {course.earnedXP}/{course.totalXP}
              </div>
            )
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

