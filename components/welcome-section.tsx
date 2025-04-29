"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserData {
  name: string;
  avatar: string;
  level: number;
  levelTitle: string;
  tier: string;
  tierEmoji: string;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  achievements: number;
  daysActive: number;
}

interface WelcomeSectionProps {
  userData: UserData;
}

export function WelcomeSection({ userData }: WelcomeSectionProps) {
  return (
    <motion.div
      className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 flex flex-col md:flex-row justify-between items-center gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {userData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-xs text-white rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {userData.level}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {userData.name}!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your learning journey?
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
