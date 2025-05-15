import React from 'react';
import { cn } from '@/lib/utils';
import { Code, Zap, Shuffle } from 'lucide-react';
import { Button } from '@/components/nexpractice/ui/button';

interface BlueThemeHeroProps {
  title?: string;
  subtitle?: string;
  className?: string;
  onDailyChallenge?: () => void;
  onRandomProblem?: () => void;
}

export function BlueThemeHero({
  title = "NexPractice",
  subtitle = "Master coding through structured practice in our uniquely personalized learning environment.",
  className,
  onDailyChallenge,
  onRandomProblem
}: BlueThemeHeroProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl",
      className
    )}>
      {/* Abstract background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-blue-50/80 to-blue-50/70 dark:from-blue-950/90 dark:via-blue-950/80 dark:to-blue-950/70">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="url(#smallGrid)" />
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-500/10 dark:to-blue-600/10 blur-2xl"></div>
        <div className="absolute bottom-[15%] right-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-500/10 dark:to-blue-600/10 blur-2xl"></div>
        <div className="absolute top-[40%] right-[20%] w-16 h-16 rounded-full bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-500/10 dark:to-blue-600/10 blur-xl"></div>
      </div>

      <div className="relative px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              {/* Logo with code brackets and 3D effect */}
              <div className="relative flex items-center justify-center w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-xl transform rotate-3 opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl transform -rotate-3 opacity-80"></div>
                <div className="relative z-10 flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 rounded-lg shadow-inner">
                  <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              {/* Title with gradient line */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-300 dark:via-blue-400 dark:to-blue-300">
                  {title}
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full mt-0.5"></div>
              </div>
            </div>
            
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {subtitle}
            </p>
            
            {/* Call-to-action buttons */}
            <div className="flex flex-wrap gap-3 mt-3">
              <Button 
                variant="gradient" 
                className="relative group overflow-hidden gap-2 shadow-md border-0 px-4 py-4 h-9"
                onClick={onDailyChallenge}
              >
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3),transparent_55%)]"></div>
                <div className="relative flex items-center">
                  <Zap className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="font-medium">Daily Challenge</span>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="relative overflow-hidden gap-2 shadow-sm px-4 py-4 h-9 group"
                onClick={onRandomProblem}
              >
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent_65%)]"></div>
                <div className="relative flex items-center">
                  <Shuffle className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:rotate-180" />
                  <span className="font-medium">Random Problem</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Right-side stats could be added here as children */}
          <div className="w-full lg:w-auto">
            {/* Content will come from parent */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlueThemeHero; 