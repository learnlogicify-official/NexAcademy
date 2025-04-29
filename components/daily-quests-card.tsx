import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flag } from "lucide-react";
import { QuestItem, type Quest } from "./quest-item";

interface DailyQuestsCardProps {
  quests: Quest[];
}

export function DailyQuestsCard({ quests }: DailyQuestsCardProps) {
  // Calculate quest completion stats
  const completedQuests = quests.filter((q) => q.completed).length;
  const totalXpEarned = quests
    .filter((q) => q.completed)
    .reduce((sum, q) => sum + q.xp, 0);
  const totalXpAvailable = quests.reduce((sum, q) => sum + q.xp, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Flag className="h-5 w-5 text-green-500 mr-2" />
            <CardTitle className="text-lg">Daily Quests</CardTitle>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {completedQuests}/{quests.length} completed
            </span>
            <Badge className="bg-primary/10 text-primary min-w-[90px] flex items-center justify-center">
              +{totalXpEarned}/{totalXpAvailable} XP
            </Badge>
          </div>
          <Progress
            value={(completedQuests / quests.length) * 100}
            className="h-2 mt-1"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests
          .slice()
          .sort((a, b) => {
            // Sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            // If same completion status, sort by XP (higher XP first)
            return b.xp - a.xp;
          })
          .map((quest) => (
            <QuestItem key={quest.id} quest={quest} />
          ))}
      </CardContent>
    </Card>
  );
}
