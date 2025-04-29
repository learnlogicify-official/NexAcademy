"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

export interface Achievement {
  id: number;
  title: string;
  description: string;
  progress: number;
  icon: string;
}

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="m-0 flex-1 flex flex-col">
      <div className="space-y-4 flex-1">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className="border rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary p-3 rounded-full h-12 w-12 flex items-center justify-center text-2xl">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <span className="text-sm font-semibold">
                    {achievement.progress}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
            <Progress value={achievement.progress} className="h-2 mt-2" />
          </motion.div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full gap-1 mt-4">
        View All Achievements <Trophy className="h-4 w-4" />
      </Button>
    </div>
  );
}
