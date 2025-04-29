import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target } from "lucide-react";

export interface Quest {
  id: string;
  text: string;
  xp: number;
  completed: boolean;
  type: "study" | "challenge" | "practice";
}

interface QuestItemProps {
  quest: Quest;
}

export function QuestItem({ quest }: QuestItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card border hover:shadow-md transition-shadow w-full">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`p-1 rounded-md ${
            quest.completed ? "bg-green-500/20" : "bg-blue-500/20"
          }`}
        >
          {quest.completed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Target className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <span
          className={`text-sm font-medium truncate ${
            quest.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {quest.text}
        </span>
      </div>
      <div className="ml-3 flex-shrink-0">
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary min-w-[70px] flex items-center justify-center"
        >
          +{quest.xp} XP
        </Badge>
      </div>
    </div>
  );
}
