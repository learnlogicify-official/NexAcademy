import React from 'react';
import { cn } from '@/lib/utils';

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'EASY' | 'MEDIUM' | 'HARD';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
  showLabel?: boolean;
}

export function DifficultyBadge({ difficulty, className, showLabel = true }: DifficultyBadgeProps) {
  // Normalize the difficulty to ensure proper casing
  const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  
  // Style variations based on difficulty level, using blue theme with different intensities
  const badgeStyles = {
    Easy: {
      container: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30",
      dot: "bg-blue-500"
    },
    Medium: {
      container: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40",
      dot: "bg-blue-600"
    },
    Hard: {
      container: "bg-blue-200 text-blue-800 border border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50",
      dot: "bg-blue-700"
    }
  };
  
  const style = badgeStyles[normalizedDifficulty as keyof typeof badgeStyles];
  
  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", 
      style.container,
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full mr-1", style.dot)} />
      {showLabel && normalizedDifficulty}
    </div>
  );
}

export default DifficultyBadge; 