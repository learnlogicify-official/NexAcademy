import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Clock, Star, BarChart2 } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  value: number | string;
  max?: number;
  icon?: 'trophy' | 'clock' | 'star' | 'chart';
  trend?: number;
  className?: string;
}

export function ProgressCard({
  title,
  value,
  max = 100,
  icon = 'chart',
  trend,
  className
}: ProgressCardProps) {
  // Convert value to number for calculations if it's a string
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  
  // Calculate percentage if max is provided
  const percentage = max ? Math.min(Math.max(0, (numericValue / max) * 100), 100) : 0;
  
  // Determine icon component
  const IconComponent = {
    trophy: Trophy,
    clock: Clock,
    star: Star,
    chart: BarChart2
  }[icon];
  
  return (
    <div className={cn(
      "rounded-lg bg-gradient-to-br from-blue-50/90 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800/50 p-4 shadow-sm",
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {IconComponent && (
            <div className="mr-2 p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-blue-100 dark:border-blue-900/20">
              <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h3>
        </div>
        
        {trend !== undefined && (
          <div className={cn(
            "text-xs font-medium rounded-full px-1.5 py-0.5 flex items-center",
            trend > 0 
              ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" 
              : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="flex items-baseline mb-3">
        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{value}</span>
        {max && max !== 100 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/{max}</span>
        )}
      </div>
      
      {max && (
        <div className="relative h-1.5 w-full bg-blue-200/50 dark:bg-blue-800/30 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ProgressCard; 