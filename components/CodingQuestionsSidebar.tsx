import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  Search, 
  Filter, 
  Tag, 
  X, 
  ChevronDown, 
  BarChart2, 
  Star,
  CircleCheck,
  CircleSlash,
  Flame,
  Brain,
  Bookmark,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const CODING_QUESTIONS_QUERY = gql`
  query CodingQuestions(
    $page: Int, 
    $limit: Int, 
    $search: String, 
    $tagIds: [ID!], 
    $difficulty: QuestionDifficulty
  ) {
    codingQuestions(
      page: $page, 
      limit: $limit, 
      search: $search, 
      tagIds: $tagIds, 
      difficulty: $difficulty
    ) {
      codingQuestions {
        id
        questionId
        difficulty
        question {
          id
          name
          solvedByCount
          accuracy
        }
        tags {
          id
          name
        }
      }
      totalCount
    }
  }
`;

const TAGS_QUERY = gql`
  query Tags {
    tags {
      id
      name
      description
      _count {
        codingQuestions
      }
    }
  }
`;

interface CodingQuestionsSidebarProps {
  currentQuestionId: string;
  open: boolean;
  onClose: () => void;
}

export function CodingQuestionsSidebar({ currentQuestionId, open, onClose }: CodingQuestionsSidebarProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const limit = 25;
  const router = useRouter();
  const [tags, setTags] = useState<any[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  // Fixed height constants for smoother scrolling
  const listItemHeight = 64; // Approximate height of each question item

  // Replace useQuery with useLazyQuery for coding questions
  const [fetchQuestions, { data, loading, fetchMore }] = useLazyQuery(CODING_QUESTIONS_QUERY, {
    fetchPolicy: "cache-and-network"
  });

  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  // Fetch coding questions only on first open
  useEffect(() => {
    if (open && !questionsLoaded) {
      fetchQuestions({
        variables: {
          page: 1,
          limit,
          search: debouncedSearch,
          tagIds: selectedTags.length > 0 ? selectedTags : undefined,
          difficulty: selectedDifficulty
        }
      });
      setQuestionsLoaded(true);
    }
  }, [open, questionsLoaded, fetchQuestions, debouncedSearch, selectedTags, selectedDifficulty, limit]);

  // Refetch questions if filters/search change while sidebar is open
  useEffect(() => {
    if (open && questionsLoaded) {
      fetchQuestions({
        variables: {
          page: 1,
          limit,
          search: debouncedSearch,
          tagIds: selectedTags.length > 0 ? selectedTags : undefined,
          difficulty: selectedDifficulty
        }
      });
    }
  }, [debouncedSearch, selectedTags, selectedDifficulty, open, questionsLoaded, fetchQuestions, limit]);

  // Lazy query for tags
  const [fetchTags, { data: tagsData }] = useLazyQuery(TAGS_QUERY);

  // Fetch tags only on first open
  useEffect(() => {
    if (open && !tagsLoaded) {
      fetchTags();
      setTagsLoaded(true);
    }
  }, [open, tagsLoaded, fetchTags]);

  // Update tags state when tagsData is loaded
  useEffect(() => {
    if (tagsData && tagsData.tags) {
      setTags(tagsData.tags);
    }
  }, [tagsData]);

  // Extract data for render optimization
  const questions = data?.codingQuestions?.codingQuestions || [];
  const totalCount = data?.codingQuestions?.totalCount || 0;
  const hasMore = questions.length < totalCount;
  
  // Initialize scroll handler reference
  const scrollHandler = useRef<((e: Event) => void) | null>(null);
  const scrollableRef = useRef<HTMLElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  // Debounce search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedTags, selectedDifficulty]);

  // Scroll handler setup - completely DOM-based approach
  useEffect(() => {
    // Skip if not open or no more data
    if (!open) return;

    // Clean up previous handler if exists
    if (scrollHandler.current && scrollableRef.current) {
      scrollableRef.current.removeEventListener('scroll', scrollHandler.current);
      scrollHandler.current = null;
    }

    // Create handler
    const handleScroll = (e: Event) => {
      // Skip if already loading or no more data
      if (isLoadingMoreRef.current || !hasMore || loading) return;

      const target = e.target as HTMLElement;
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      
      // Only load more when close to the bottom (200px) and not already loading
      if (scrollBottom < 200) {
        isLoadingMoreRef.current = true;
        
        // Add a small loading indicator at bottom without re-rendering the whole component
        const loadingEl = document.createElement('div');
        loadingEl.className = 'py-3 text-center';
        loadingEl.innerHTML = '<div class="inline-block animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>';
        
        // Find the questions list
        const questionsList = document.querySelector('.sidebar-questions-list');
        if (questionsList) {
          questionsList.appendChild(loadingEl);
        }
        
        // Fetch more questions
        fetchMore({
          variables: {
            page: page + 1,
            limit,
            search: debouncedSearch,
            tagIds: selectedTags.length > 0 ? selectedTags : undefined,
            difficulty: selectedDifficulty
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              codingQuestions: {
                ...prev.codingQuestions,
                codingQuestions: [
                  ...prev.codingQuestions.codingQuestions,
                  ...fetchMoreResult.codingQuestions.codingQuestions
                ],
                totalCount: fetchMoreResult.codingQuestions.totalCount
              }
            };
          }
        }).then(() => {
          // Update page number
          setPage(p => p + 1);
          
          // Remove loading indicator
          if (loadingEl && loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
          }
          
          // Reset loading flag 
          isLoadingMoreRef.current = false;
        }).catch(() => {
          isLoadingMoreRef.current = false;
          // Remove loading indicator on error
          if (loadingEl && loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
          }
        });
      }
    };

    // Store handler in ref
    scrollHandler.current = handleScroll;
    
    // Find scrollable area and attach handler
    const setupScrollHandler = () => {
      const scrollArea = document.querySelector('.sidebar-container [data-radix-scroll-area-viewport]');
      if (scrollArea && scrollHandler.current) {
        scrollableRef.current = scrollArea as HTMLElement;
        scrollArea.addEventListener('scroll', scrollHandler.current, { passive: true });
      }
    };
    
    // Try to set up handler immediately and after a delay
    setupScrollHandler();
    const setupTimer = setTimeout(setupScrollHandler, 500);
    
    return () => {
      clearTimeout(setupTimer);
      if (scrollHandler.current && scrollableRef.current) {
        scrollableRef.current.removeEventListener('scroll', scrollHandler.current);
      }
    };
  }, [open, hasMore, loading, page, fetchMore, limit, debouncedSearch, selectedTags, selectedDifficulty]);

  const handleSelectDifficulty = (difficulty: string) => {
    if (selectedDifficulty === difficulty) {
      setSelectedDifficulty(null);
    } else {
      setSelectedDifficulty(difficulty);
    }
  };

  const handleSelectTag = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty(null);
    setSelectedTags([]);
    setActiveTab('all');
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch(difficulty) {
      case 'EASY':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-200 dark:border-green-800/50',
          hover: 'hover:bg-green-200 dark:hover:bg-green-800/50',
          icon: <CircleCheck className="h-3.5 w-3.5 mr-1.5" />
        };
      case 'MEDIUM':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800/50',
          hover: 'hover:bg-amber-200 dark:hover:bg-amber-800/50',
          icon: <Flame className="h-3.5 w-3.5 mr-1.5" />
        };
      case 'HARD':
      case 'VERY_HARD':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800/50',
          hover: 'hover:bg-red-200 dark:hover:bg-red-800/50',
          icon: <Brain className="h-3.5 w-3.5 mr-1.5" />
        };
      default:
        return {
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          border: 'border-purple-200 dark:border-purple-800/50',
          hover: 'hover:bg-purple-200 dark:hover:bg-purple-800/50',
          icon: <BadgeCheck className="h-3.5 w-3.5 mr-1.5" />
        };
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <>
      {/* Backdrop when sidebar is open on mobile */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 h-full z-40 bg-white dark:bg-slate-900 border-r border-indigo-100 dark:border-indigo-900/50 shadow-lg transition-all duration-300 ease-in-out flex flex-col sidebar-container",
          open ? "translate-x-0 w-80 md:w-96" : "-translate-x-full w-80 md:w-96"
        )}
        style={{ minWidth: 300, maxWidth: 420 }}
      >
        {/* Header with search */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Coding Problems</span>
            </div>
            <button 
              onClick={onClose} 
              className="flex items-center justify-center h-7 w-7 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable area: search, filters, and questions list */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {/* Search box */}
          <div className="p-3 bg-white dark:bg-slate-900">
            <div className={cn(
              "flex items-center rounded-md border transition-colors duration-200",
              isSearchFocused 
                ? "border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-400/30 dark:ring-indigo-500/30" 
                : "border-gray-200 dark:border-gray-700"
            )}>
              <Search className="h-4 w-4 mx-2 text-slate-500 dark:text-slate-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search problems..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs and dropdowns */}
          <div className="px-3 py-2 flex flex-col gap-2 bg-gray-50/80 dark:bg-slate-800/50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-8 bg-slate-100 dark:bg-slate-800/70">
                <TabsTrigger 
                  value="all" 
                  className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="easy" 
                  className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                  onClick={() => handleSelectDifficulty("EASY")}
                >
                  Easy
                </TabsTrigger>
                <TabsTrigger 
                  value="medium" 
                  className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                  onClick={() => handleSelectDifficulty("MEDIUM")}
                >
                  Medium
                </TabsTrigger>
                <TabsTrigger 
                  value="hard" 
                  className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                  onClick={() => handleSelectDifficulty("HARD")}
                >
                  Hard
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8 flex items-center justify-center gap-1 bg-white dark:bg-slate-800">
                    <Tag className="h-3.5 w-3.5" />
                    Tags
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-h-60 overflow-y-auto">
                  {tags.map((tag: any) => (
                    <DropdownMenuCheckboxItem
                      key={tag.id}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleSelectTag(tag.id)}
                      className="capitalize"
                    >
                      {tag.name} 
                      {tag._count?.codingQuestions > 0 && (
                        <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                          ({tag._count.codingQuestions})
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {(selectedTags.length > 0 || selectedDifficulty || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs h-8 flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400"
                >
                  <CircleSlash className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active filters */}
            {(selectedTags.length > 0 || selectedDifficulty) && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedDifficulty && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs py-0 h-5 gap-1",
                      getDifficultyStyle(selectedDifficulty).color,
                      getDifficultyStyle(selectedDifficulty).bg,
                      getDifficultyStyle(selectedDifficulty).border
                    )}
                  >
                    {formatDifficulty(selectedDifficulty)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedDifficulty(null)}
                    />
                  </Badge>
                )}
                {selectedTags.map(tagId => {
                  const tag: any = tags.find((t: any) => t.id === tagId);
                  return tag ? (
                    <Badge 
                      key={tagId}
                      variant="outline"
                      className="text-xs py-0 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 gap-1"
                    >
                      {tag.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleSelectTag(tagId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Questions list */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto">
              {loading && questions.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
                </div>
              ) : (
                <>
                  {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-slate-700 dark:text-slate-300 font-medium mb-1">No questions found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Try changing your search or filters
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearFilters}
                        className="mt-3"
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 sidebar-questions-list">
                      {questions.map((q: any) => {
                        const diffStyle = getDifficultyStyle(q.difficulty);
                        const isCurrentQuestion = (q.questionId || q.id) === currentQuestionId;
                        
                        return (
                          <li
                            key={q.questionId || q.id}
                            className={cn(
                              "relative px-3 py-2 cursor-pointer transition-all group",
                              isCurrentQuestion 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-3 border-indigo-500 dark:border-indigo-400" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/70 border-l-3 border-transparent",
                            )}
                            onClick={() => router.push(`/nexpractice/problem/${q.questionId || q.id}`)}
                          >
                            <div className="flex items-center">
                              {/* Difficulty indicator dot */}
                              <div className={cn(
                                "w-2 h-2 flex-shrink-0 rounded-full mr-2",
                                diffStyle.color.replace('text', 'bg').replace('dark:text', 'dark:bg')
                              )}></div>
                              
                              <div className="min-w-0 flex-1">
                                {/* Problem name and difficulty */}
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "truncate text-sm leading-tight font-medium max-w-[280px]",
                                    isCurrentQuestion 
                                      ? "text-indigo-700 dark:text-indigo-300"
                                      : "text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                  )} title={q.question?.name || q.questionText}>
                                    {(q.question?.name || q.questionText).substring(0, 55)}
                                    {(q.question?.name || q.questionText).length > 55 ? '...' : ''}
                                  </span>
                                  
                                  <span className={cn(
                                    "inline-flex items-center px-1.5 py-0.5 rounded-sm text-[0.65rem] font-medium leading-none flex-shrink-0",
                                    diffStyle.color,
                                    diffStyle.bg,
                                    "border",
                                    diffStyle.border
                                  )}>
                                    {formatDifficulty(q.difficulty)}
                                  </span>
                                </div>
                                
                                {/* Tags and metadata */}
                                <div className="flex items-center mt-1 space-x-1 overflow-hidden">
                                  {q.tags && q.tags.length > 0 && (
                                    <div className="flex flex-nowrap gap-1 max-w-[160px] overflow-hidden">
                                      {q.tags.slice(0, 2).map((tag: any) => (
                                        <Badge 
                                          key={tag.id}
                                          variant="outline"
                                          className="px-1 py-0 text-[0.6rem] leading-none h-3.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 whitespace-nowrap"
                                        >
                                          {tag.name.length > 10 ? tag.name.substring(0, 10) + '...' : tag.name}
                                        </Badge>
                                      ))}
                                      {q.tags.length > 2 && (
                                        <Badge 
                                          variant="outline"
                                          className="px-1 py-0 text-[0.6rem] leading-none h-3.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 whitespace-nowrap"
                                        >
                                          +{q.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex ml-auto items-center text-[0.65rem] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    {q.question?.solvedByCount && (
                                      <span className="inline-flex items-center mr-1.5">
                                        <CircleCheck className="h-2.5 w-2.5 mr-0.5 text-green-500" />
                                        {q.question.solvedByCount}
                                      </span>
                                    )}
                                    {q.question?.accuracy && (
                                      <span className="inline-flex items-center">
                                        <Star className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                                        {Math.round(q.question.accuracy * 100)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                      
                      {/* Static loader that doesn't affect scroll position */}
                      {hasMore && questions.length > 0 && (
                        <li className="h-16 flex-shrink-0" style={{ height: listItemHeight }}>
                          {/* This is a placeholder for the dynamically injected loader */}
                        </li>
                      )}
                      
                      {/* End of list indicator */}
                      {!hasMore && questions.length > 0 && (
                        <li className="text-center text-xs text-slate-400 py-3">
                          End of list • {questions.length} questions
                        </li>
                      )}
                    </ul>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 dark:border-slate-800 py-2 px-4 bg-white dark:bg-slate-900 text-xs text-center text-slate-500 dark:text-slate-400">
          <div className="flex justify-between items-center">
            <div>
              <Bookmark className="h-3.5 w-3.5 inline-block mr-1" />
              NexPractice
            </div>
            <div>
              Total: {totalCount} problems
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 