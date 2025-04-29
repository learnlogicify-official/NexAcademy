import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Flame } from "lucide-react";

export interface StreakDay {
  day: string;
  completed: boolean;
}

interface DailyStreakCardProps {
  currentStreak: number;
  highestStreak: number;
  weeklyStreak: StreakDay[];
}

export function DailyStreakCard({
  currentStreak,
  highestStreak,
  weeklyStreak,
}: DailyStreakCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Daily Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3D2A15] mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{currentStreak} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest streak: {highestStreak} days
            </p>
          </div>
        </div>

        {/* Weekly Streak Visualization */}
        <div className="mt-4 mb-2 bg-muted rounded-lg p-3">
          <div className="flex justify-between px-1 mb-1.5">
            {weeklyStreak.map((day, index) => (
              <div
                key={index}
                className="text-xs font-medium text-muted-foreground w-6 text-center"
              >
                {day.day}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {weeklyStreak.map((day, index) => (
              <div
                key={index}
                className={`relative flex h-6 w-6 items-center justify-center rounded-full 
                ${
                  day.completed
                    ? "bg-orange-500"
                    : "bg-secondary border border-border"
                }`}
              >
                {day.completed && (
                  <Check className="h-3 w-3 text-white stroke-[3]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Keep your streak going!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
