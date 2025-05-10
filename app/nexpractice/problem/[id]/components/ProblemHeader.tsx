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
  Users
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
    <div className="mb-2 relative z-10 overflow-hidden">
      {/* Ultra-compact elegant header with horizontal layout */}
      <div className="flex items-center space-x-3">
        {/* Problem number pill with glowing effect */}
        <div className="relative flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 shadow-lg group">
          <div className="absolute inset-0 rounded-full blur-sm opacity-50 bg-indigo-500 group-hover:opacity-70 transition-all duration-300"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-full px-2.5 py-1 flex items-center gap-1 border border-indigo-100 dark:border-indigo-800/50">
            <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">#{problemNumber}</span>
          </div>
        </div>
        
        {/* Title and difficulty section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold truncate">{problemTitle}</h1>
            {/* Difficulty badge */}
            <div className="flex-shrink-0">
              {getDifficultyBadge(difficulty)}
            </div>
          </div>
          
          {/* Stats row - very compact */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {/* Solved by count */}
            <div className="flex items-center">
              <Users className="h-3 w-3 text-blue-500 dark:text-blue-400 mr-0.5" />
              <span className="font-medium">{solvedBy.toLocaleString()} solved</span>
            </div>
            
            {/* Dot separator */}
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            
            {/* Accept rate */}
            <div className="flex items-center">
              <Check className="h-3 w-3 text-green-500 dark:text-green-400 mr-0.5" />
              <span>68% acceptance</span>
            </div>
            
            {/* Dot separator */}
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            
            {/* Rating */}
            <div className="flex items-center">
              <Star className="h-3 w-3 text-amber-500 dark:text-amber-400 mr-0.5" />
              <span>4.8</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons with tooltip - compact row */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          {/* Tags section - wrap below main header on small screens */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="py-0 h-5 text-xs bg-gray-50/80 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {getTagName(tag)}
              </Badge>
            ))}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                  <Bookmark className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bookmark</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                  <ExternalLink className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
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
                    className="h-7 w-7 rounded-full"
                    onClick={toggleLeftPanelExpansion} 
                    aria-label={isLeftPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
                  >
                    {isLeftPanelExpanded ? (
                      <Minimize2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isLeftPanelExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Mobile tags row - only shown on smallest screens */}
      <div className="flex sm:hidden flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="py-0 h-5 text-xs bg-gray-50/80 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            {getTagName(tag)}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default ProblemHeader 