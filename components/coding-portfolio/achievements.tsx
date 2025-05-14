"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Award, Trophy, Star, Target, Zap, BarChart2, Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCircularProgress } from "./animated-progress"

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  platform?: string;
  platformIcon?: string;
  date?: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  className?: string;
}

export function Achievements({ achievements, className = "" }: AchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Group achievements by completion status
  const completedAchievements = achievements.filter(a => a.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.isCompleted);
  
  // Calculate completion percentage
  const completionPercentage = Math.round((completedAchievements.length / achievements.length) * 100);
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2 relative">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            Coding Achievements
          </CardTitle>
          <div className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="font-medium text-amber-500">{completedAchievements.length}</span> / {achievements.length}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Summary */}
          <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-100 dark:border-slate-800">
            <AnimatedCircularProgress
              value={completedAchievements.length}
              max={achievements.length}
              color="amber"
              size={120}
              strokeWidth={10}
              className="mb-4"
            />
            
            <h3 className="text-xl font-bold mb-1">
              {completionPercentage}% Complete
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
              You've earned {completedAchievements.length} of {achievements.length} available achievements
            </p>
            
            <div className="w-full grid grid-cols-2 gap-3 text-center">
              <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Star className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-lg font-semibold">
                  {completedAchievements.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Completed
                </span>
              </div>
              
              <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Target className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-lg font-semibold">
                  {inProgressAchievements.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  In Progress
                </span>
              </div>
            </div>
          </div>
          
          {/* Right column: Achievement grid */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  className={`relative p-3 rounded-lg border cursor-pointer transition-all group
                    ${achievement.isCompleted 
                      ? `border-${achievement.color}/30 bg-white dark:bg-slate-900` 
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  {/* Badge for completed achievements */}
                  {achievement.isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-10">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className={`p-3 rounded-full mb-3
                        ${achievement.isCompleted 
                          ? `bg-${achievement.color}/20 text-${achievement.color}` 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {achievement.icon}
                    </div>
                    
                    <h4 className={`font-medium text-sm mb-1 line-clamp-1
                      ${achievement.isCompleted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {achievement.name}
                    </h4>
                    
                    {/* Progress bar for incomplete achievements */}
                    {!achievement.isCompleted && (
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                        <div 
                          className={`h-full bg-${achievement.color} rounded-full`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    )}
                    
                    {/* Platform badge if available */}
                    {achievement.platform && achievement.platformIcon && (
                      <div className="mt-2 flex items-center justify-center">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                          <img src={achievement.platformIcon} alt={achievement.platform} className="h-3 w-3" />
                          <span className="text-slate-500 dark:text-slate-400">{achievement.platform}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Achievement detail modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAchievement(null)}>
            <motion.div 
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-full bg-${selectedAchievement.color}/20 text-${selectedAchievement.color}`}>
                  {selectedAchievement.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedAchievement.name}</h3>
                  {selectedAchievement.platform && (
                    <div className="flex items-center gap-1 mt-1">
                      {selectedAchievement.platformIcon && (
                        <img src={selectedAchievement.platformIcon} alt={selectedAchievement.platform} className="h-4 w-4" />
                      )}
                      <span className="text-sm text-slate-500 dark:text-slate-400">{selectedAchievement.platform}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {selectedAchievement.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div>
                  {selectedAchievement.isCompleted ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Complete</span>
                      {selectedAchievement.date && (
                        <span className="text-sm text-slate-400 ml-2">
                          {selectedAchievement.date}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400">
                      <span className="font-medium">{selectedAchievement.progress}</span> / {selectedAchievement.maxProgress} progress
                    </div>
                  )}
                </div>
                
                <button 
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  onClick={() => setSelectedAchievement(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example achievement data creators for different types of achievements
export function createProblemAchievement(id: string, name: string, progress: number, max: number, platform?: string, platformIcon?: string): Achievement {
  return {
    id,
    name,
    description: `Solve ${max} problems on ${platform || 'coding platforms'}`,
    icon: <Code className="h-5 w-5" />,
    color: 'primary',
    progress,
    maxProgress: max,
    isCompleted: progress >= max,
    platform,
    platformIcon,
    date: progress >= max ? new Date().toLocaleDateString() : undefined
  };
}

export function createContestAchievement(id: string, name: string, progress: number, max: number, platform?: string, platformIcon?: string): Achievement {
  return {
    id,
    name,
    description: `Participate in ${max} coding contests on ${platform || 'coding platforms'}`,
    icon: <Trophy className="h-5 w-5" />,
    color: 'amber-500',
    progress,
    maxProgress: max,
    isCompleted: progress >= max,
    platform,
    platformIcon,
    date: progress >= max ? new Date().toLocaleDateString() : undefined
  };
}

export function createRankAchievement(id: string, name: string, rank: number, targetRank: number, platform?: string, platformIcon?: string): Achievement {
  return {
    id,
    name,
    description: `Achieve a rank of ${targetRank} or better on ${platform || 'a coding platform'}`,
    icon: <BarChart2 className="h-5 w-5" />,
    color: 'blue-500',
    progress: targetRank - rank > 0 ? targetRank - rank : targetRank,
    maxProgress: targetRank,
    isCompleted: rank <= targetRank,
    platform,
    platformIcon,
    date: rank <= targetRank ? new Date().toLocaleDateString() : undefined
  };
}

export function createStreakAchievement(id: string, name: string, streak: number, targetStreak: number): Achievement {
  return {
    id,
    name,
    description: `Maintain a coding streak of ${targetStreak} consecutive days`,
    icon: <Zap className="h-5 w-5" />,
    color: 'green-500',
    progress: streak,
    maxProgress: targetStreak,
    isCompleted: streak >= targetStreak,
    date: streak >= targetStreak ? new Date().toLocaleDateString() : undefined
  };
}

export function createActiveAchievement(id: string, name: string, activeDays: number, targetDays: number): Achievement {
  return {
    id,
    name,
    description: `Be active for a total of ${targetDays} days on coding platforms`,
    icon: <Calendar className="h-5 w-5" />,
    color: 'indigo-500',
    progress: activeDays,
    maxProgress: targetDays,
    isCompleted: activeDays >= targetDays,
    date: activeDays >= targetDays ? new Date().toLocaleDateString() : undefined
  };
}

// Helper component for code icon
function Code(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
} 