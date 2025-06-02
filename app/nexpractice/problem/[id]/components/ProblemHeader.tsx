import React from 'react'
import { 
  Star, 
  Clock, 
  Check, 
  Eye, 
  Maximize2, 
  Minimize2,
  Award,
  ExternalLink,
  Bookmark,
  Users,
  Hash,
  BarChart2,
  Shield
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define Shape type to match what's expected in ProblemClientPage
interface Shape {
  id?: string;
  name: string;
  [key: string]: any; // Allow for additional properties
}

interface ProblemHeaderProps {
  problemNumber: number
  problemTitle: string
  difficulty: string
  isLeftPanelExpanded: boolean
  toggleLeftPanelExpansion: () => void
  isMobile: boolean
  getDifficultyBadge: (diff: string) => React.ReactNode
  xpReward?: number
  tags?: Shape[] | string[]
  solvedBy?: number
}

const ProblemHeader = ({
  problemNumber,
  problemTitle,
  difficulty,
  isLeftPanelExpanded,
  toggleLeftPanelExpansion,
  isMobile,
  getDifficultyBadge,
  tags = [{ name: 'Array' }, { name: 'Hash Table' }, { name: 'Two Pointers' }],
  solvedBy = 1248
}: ProblemHeaderProps) => {
  // Function to get tag name regardless of tag format (string or Shape object)
  const getTagName = (tag: Shape | string): string => {
    if (typeof tag === 'string') return tag;
    return tag.name || 'Unknown';
  };

  return (
    <div className="mb-4 relative z-10 overflow-hidden">
      {/* Premium header with glass effect */}
      <div className="p-4">

        
        {/* Content container */}
        <div className="flex flex-col space-y-3">
          {/* Title and actions row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{problemTitle}</h1>
            </div>
            
            {/* Action buttons */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-lg text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bookmark</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-lg text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        onClick={toggleLeftPanelExpansion} 
                        aria-label={isLeftPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
                      >
                        {isLeftPanelExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isLeftPanelExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {/* Metadata row with improved display */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Difficulty badge - more prominent */}
            <div className="flex-shrink-0 order-1">
              {getDifficultyBadge(difficulty)}
            </div>
            
            {/* Stats with improved visual hierarchy */}
            <div className="flex items-center gap-3 order-2">
              {/* Solved by count */}
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Users className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 mr-1.5" />
                <span className="font-medium">{solvedBy.toLocaleString()}</span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Star className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-1.5" />
                <span className="font-medium">4.8</span>
              </div>
              
              {/* Accept rate */}
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 text-green-500 dark:text-green-400 mr-1.5" />
                <span className="font-medium">68%</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="hidden md:block h-4 w-px bg-slate-200 dark:bg-slate-700 order-3"></div>
            
            {/* Tags section with improved styling */}
            <div className="flex flex-wrap items-center gap-1.5 order-4 mt-1.5 md:mt-0 w-full md:w-auto">
              {tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="py-0.5 px-2 h-6 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {getTagName(tag)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemHeader 