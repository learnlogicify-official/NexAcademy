export interface PlatformProfile {
  platform: string
  username: string
  totalSolved?: number
  rank?: number | string
  rating?: number
  contests?: number
  badges?: number
  score?: number
  problemsByDifficulty?: Record<string, number>
  error?: string
  contestHistory?: ContestData[]
  activityHeatmap?: Array<{
    date: string
    count: number
  }>
  stats?: {
    streak?: number
    totalActiveDays?: number
  }
  data?: any
}

export interface ContestData {
  name: string
  date: string
  rank: number
  rating?: number
  position?: number
  standing?: number
} 