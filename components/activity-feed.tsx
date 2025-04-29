"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface ActivityItem {
  id: number;
  title: string;
  time: string;
  type: "chapter" | "badge" | "level" | "forum";
  icon: ReactNode;
  xp?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4 m-0 flex-1 flex flex-col">
      <div className="flex-1">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="bg-secondary p-2 rounded-full">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1">
                <p className="font-medium truncate flex-1 min-w-0">
                  {activity.title}
                </p>
                {activity.xp && activity.xp > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary whitespace-nowrap flex-shrink-0"
                  >
                    +{activity.xp} XP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full gap-1 mt-auto">
        View All Activity <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
