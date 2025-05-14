"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, BarChart2, Code, Award, Star } from "lucide-react"

interface CodingStatsCardProps {
  title: string
  icon?: React.ReactNode
  value: string | number
  subtitle?: string
  trend?: number
  color?: string
  onClick?: () => void
}

export function CodingStatsCard({
  title,
  icon,
  value,
  subtitle,
  trend,
  color = "primary",
  onClick,
}: CodingStatsCardProps) {
  // Determine color classes based on the color prop
  const bgGradient = `bg-gradient-to-br from-${color}/10 to-${color}/5`
  const iconBg = `bg-${color}/20`
  const iconColor = `text-${color}`
  
  return (
    <Card className={bgGradient}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-3xl font-bold mt-1">{value}</div>
            {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
          </div>
          
          {icon && (
            <div className={`p-2 ${iconBg} rounded-full`}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center mt-3">
            <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
      
      {onClick && (
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="w-full justify-start px-0" onClick={onClick}>
            View details
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Pre-configured stat cards
export function ProblemsCard({ count, trend, onClick }: { count: number, trend?: number, onClick?: () => void }) {
  return (
    <CodingStatsCard
      title="Problems Solved"
      icon={<Code className="h-4 w-4" />}
      value={count}
      trend={trend}
      color="primary"
      onClick={onClick}
    />
  )
}

export function ContestsCard({ count, trend, onClick }: { count: number, trend?: number, onClick?: () => void }) {
  return (
    <CodingStatsCard
      title="Contest Participations"
      icon={<Trophy className="h-4 w-4" />}
      value={count}
      trend={trend}
      color="amber-500"
      onClick={onClick}
    />
  )
}

export function RatingCard({ rating, platform, onClick }: { rating: number, platform: string, onClick?: () => void }) {
  return (
    <CodingStatsCard
      title="Current Rating"
      icon={<BarChart2 className="h-4 w-4" />}
      value={rating}
      subtitle={platform}
      color="blue-500"
      onClick={onClick}
    />
  )
}

export function StreakCard({ current, max, onClick }: { current: number, max: number, onClick?: () => void }) {
  return (
    <CodingStatsCard
      title="Current Streak"
      icon={<Award className="h-4 w-4" />}
      value={current}
      subtitle={`Max: ${max}`}
      color="green-500"
      onClick={onClick}
    />
  )
} 