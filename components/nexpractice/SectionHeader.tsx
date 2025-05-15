import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: 'default' | 'gradient' | 'subtle';
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  className,
  variant = 'default'
}: SectionHeaderProps) {
  const variants = {
    default: {
      container: "border-b border-blue-100 dark:border-blue-900/30 pb-3 mb-4",
      title: "text-slate-800 dark:text-slate-200 font-semibold",
      icon: "text-blue-600 dark:text-blue-400",
      description: "text-sm text-slate-600 dark:text-slate-400 mt-1",
    },
    gradient: {
      container: "border-b border-blue-100 dark:border-blue-900/30 pb-3 mb-4",
      title: "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-400 dark:via-blue-500 dark:to-blue-400 bg-clip-text text-transparent font-bold",
      icon: "text-blue-500 dark:text-blue-400",
      description: "text-sm text-slate-600 dark:text-slate-400 mt-1",
    },
    subtle: {
      container: "pb-2 mb-3",
      title: "text-blue-700 dark:text-blue-300 font-medium",
      icon: "text-blue-500 dark:text-blue-400",
      description: "text-xs text-slate-500 dark:text-slate-500 mt-0.5",
    },
  };
  
  const style = variants[variant];
  
  return (
    <div className={cn(style.container, className)}>
      <div className="flex items-center">
        {Icon && (
          <div className="mr-2">
            <Icon className={cn("h-5 w-5", style.icon)} />
          </div>
        )}
        <h2 className={cn("text-lg leading-tight", style.title)}>
          {title}
        </h2>
      </div>
      {description && (
        <div className={style.description}>
          {description}
        </div>
      )}
    </div>
  );
}

export default SectionHeader; 