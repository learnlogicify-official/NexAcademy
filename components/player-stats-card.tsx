import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, Target, Clock } from "lucide-react";

interface PlayerStats {
  coursesEnrolled: number;
  achievements: number;
  problemsSolved: number;
  daysActive: number;
}

interface PlayerStatsCardProps {
  stats: PlayerStats;
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">About the player</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-lg font-bold">{stats.coursesEnrolled}</span>
            <span className="text-xs text-muted-foreground">
              Courses Enrolled
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <Trophy className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-lg font-bold">{stats.achievements}</span>
            <span className="text-xs text-muted-foreground">Achievements</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <Target className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-lg font-bold">{stats.problemsSolved}</span>
            <span className="text-xs text-muted-foreground">
              Problems Solved
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-purple-500 mb-1" />
            <span className="text-lg font-bold">{stats.daysActive}</span>
            <span className="text-xs text-muted-foreground">Days Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
