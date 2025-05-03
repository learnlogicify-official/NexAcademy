"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Code, Blocks, Trophy, Star, BrainCircuit, Rocket, BookOpen, Clock, Zap, ChevronDown, ChevronUp, Tag as TagIcon } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProgressTracker } from "@/components/nexpractice/progress-tracker"

// Add type for tag with count
interface TagWithCount {
  id: string;
  name: string;
  _count: { codingQuestions: number };
}

export default function NexPracticePage() {
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  // Coding questions table state
  const [questions, setQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsPage, setQuestionsPage] = useState(1)
  const [questionsTotal, setQuestionsTotal] = useState(0)
  const [questionsPerPage, setQuestionsPerPage] = useState(20)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [status, setStatus] = useState("all")
  const [tagFilter, setTagFilter] = useState<string[]>([])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetch("/api/tags/with-coding-question-count")
      .then(res => res.json())
      .then(data => setTags(data))
      .finally(() => setTagsLoading(false))
  }, [])

  // Lazy loading: fetch and append questions
  useEffect(() => {
    setQuestionsLoading(true)
    const params = new URLSearchParams({
      type: "CODING",
      page: questionsPage.toString(),
      limit: questionsPerPage.toString(),
      ...(search ? { search } : {}),
      ...(difficulty !== "all" ? { difficulty } : {}),
      ...(status !== "all" ? { status } : {}),
    })
    
    // Add multiple tags to the params if selected
    if (tagFilter.length > 0) {
      tagFilter.forEach(tagId => {
        params.append('tags', tagId);
      });
    }
    
    fetch(`/api/questions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || [])
        setQuestionsTotal(data.pagination?.total || 0)
      })
      .finally(() => setQuestionsLoading(false))
  }, [questionsPage, questionsPerPage, search, difficulty, status, tagFilter])

  // Example practice problems
  const practiceProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Arrays",
      completedBy: 7894,
      accuracy: 76,
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      category: "Trees",
      completedBy: 4532,
      accuracy: 68,
    },
    {
      id: 3,
      title: "Merge Sort Implementation",
      difficulty: "Medium",
      category: "Sorting",
      completedBy: 3921,
      accuracy: 62,
    },
    {
      id: 4,
      title: "Dynamic Programming Challenge",
      difficulty: "Hard",
      category: "DP",
      completedBy: 2145,
      accuracy: 48,
    }
  ]

  // Example coding challenges
  const codingChallenges = [
    {
      id: 101,
      title: "Weekly Challenge: String Manipulation",
      deadline: "3 days left",
      participants: 324,
      prize: 200,
      xp: 500
    },
    {
      id: 102,
      title: "Algorithm Speedrun",
      deadline: "5 days left",
      participants: 186,
      prize: 150,
      xp: 350
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500"
      case "medium": return "bg-yellow-500"
      case "hard": return "bg-red-500"
      default: return "bg-blue-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-xl">
          <h1 className="text-3xl font-bold tracking-tight">NexPractice</h1>
          <p className="text-muted-foreground">Sharpen your coding skills with practice problems and challenges</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">24/100</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Code className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "24%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-amber-500/20 to-transparent p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Challenges Won</p>
                <p className="text-2xl font-bold">3</p>
                </div>
                <div className="bg-amber-500/10 p-2 rounded-full">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground">Latest win: 2 days ago</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-yellow-500/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-yellow-500/20 to-transparent p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Coding Streak</p>
                <p className="text-2xl font-bold">7 days</p>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded-full">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-2 flex-1 rounded-sm bg-yellow-500" />
                  ))}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i+7} className="h-2 flex-1 rounded-sm bg-muted" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-500/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-500/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-purple-500/20 to-transparent p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">4,250</p>
                </div>
                <div className="bg-purple-500/10 p-2 rounded-full">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground">+350 XP this week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Progress Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Tag Wall Section */}
            <Card className="shadow-md border-primary/10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="flex flex-row items-center justify-between py-5 px-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <TagIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">Browse by Tag</span>
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary font-medium">{tags.length}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">
                    {tagsExpanded ? 'Showing all tags' : `Showing ${Math.min(12, tags.length)} of ${tags.length} tags`}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setTagsExpanded(v => !v)}
                    className="group hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full px-4 border-primary/20"
                  >
                    {tagsExpanded ? 'Show Less' : 'Show All'}
                    {tagsExpanded ? (
                      <ChevronUp className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {tagsLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
                      <p className="text-sm text-muted-foreground">Loading tags...</p>
                    </div>
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <TagIcon className="h-7 w-7 text-muted-foreground/60" />
                    </div>
                    <p>No tags found. Tags will appear here when added to questions.</p>
                  </div>
                ) : (
                  <>
                    {/* Categories - Group tags by category or popularity */}
                    <div className="mb-6 flex gap-2 flex-wrap">
                      <Button 
                        variant={tagFilter.length === 0 ? "default" : "outline"} 
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => setTagFilter([])}
                      >
                        All Tags
                      </Button>
                      <Button
                        variant={tagFilter.length === 0 ? "outline" : "default"}
                        size="sm"
                        className="rounded-full px-4 flex items-center gap-1"
                        onClick={() => {}}
                        disabled={tagFilter.length === 0}
                      >
                        <span>Selected</span>
                        <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                          {tagFilter.length}
                        </Badge>
                      </Button>
                      
                      {tagFilter.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="rounded-full px-4 ml-auto"
                          onClick={() => setTagFilter([])}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                    
                    {/* Tag Grid */}
                    <div 
                      className={`flex flex-wrap gap-3 transition-all duration-500 ease-in-out ${tagsExpanded ? 'opacity-100' : 'opacity-100'}`}
                    >
                      {(tagsExpanded ? tags : tags.slice(0, 12)).map(tag => {
                        // Calculate tag size/importance based on question count
                        const isSelected = tagFilter.includes(tag.id);
                        const count = tag._count.codingQuestions;
                        const isMajor = count > 10;
                        const isMedium = count >= 3 && count <= 10;
                        const isMinor = count < 3;
                        
                        // Determine the style based on popularity
                        const tagCategory = isMajor ? 'popular' : isMedium ? 'medium' : 'rare';
                        const tagColors = {
                          popular: {
                            bg: "from-primary/20 to-primary/5",
                            activeBg: "from-primary/90 to-primary",
                            badge: "bg-primary/30",
                            activeBadge: "bg-white/30",
                            indicator: "bg-primary",
                            icon: "text-primary"
                          },
                          medium: {
                            bg: "from-blue-500/10 to-blue-500/5",
                            activeBg: "from-blue-600/90 to-blue-500",
                            badge: "bg-blue-500/20",
                            activeBadge: "bg-white/20",
                            indicator: "bg-blue-500",
                            icon: "text-blue-500"
                          },
                          rare: {
                            bg: "from-slate-400/10 to-slate-300/5",
                            activeBg: "from-slate-700 to-slate-600",
                            badge: "bg-slate-400/20",
                            activeBadge: "bg-white/20",
                            indicator: "bg-slate-400",
                            icon: "text-slate-400"
                          }
                        };
                        
                        return (
                          <div
                            key={tag.id}
                            onClick={(e) => {
                              // Toggle tag selection
                              setTagFilter(prev => 
                                prev.includes(tag.id) 
                                  ? prev.filter(t => t !== tag.id) 
                                  : [...prev, tag.id]
                              );
                              setQuestionsPage(1); // Reset to first page when changing filters
                            }}
                            className={`
                              group flex flex-col items-center justify-between p-5 rounded-xl
                              transition-all duration-300 cursor-pointer
                              shadow-sm hover:shadow-md
                              active:scale-95 hover:scale-103
                              bg-gradient-to-br relative overflow-hidden
                              ${tagFilter.includes(tag.id)
                                ? `${tagColors[tagCategory].activeBg} text-white shadow-lg` 
                                : `${tagColors[tagCategory].bg} bg-white/95 dark:bg-background/95 border border-primary/10 
                                   hover:border-primary/30 backdrop-blur-sm`
                              }
                            `}
                            style={{ minWidth: '120px', maxWidth: '220px', flex: '1 0 auto' }}
                          >
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 blur-2xl rounded-full"></div>
                              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/20 blur-2xl rounded-full"></div>
                              {isMajor && !isSelected && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                              )}
                            </div>
                            
                            {/* Category indicator */}
                            {!isSelected && (
                              <div className="absolute top-2 left-2">
                                {isMajor && (
                                  <div className="flex items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tagColors[tagCategory].indicator} animate-pulse mr-1`}></div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${tagColors[tagCategory].indicator} animate-pulse`} style={{animationDelay: "0.5s"}}></div>
                                  </div>
                                )}
                                {isMedium && (
                                  <div className="flex items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tagColors[tagCategory].indicator} animate-pulse`}></div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Selected indicator */}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 z-10 bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg transform rotate-12 border-2 border-white dark:border-slate-700">
                                ✓
                          </div>
                            )}
                            
                            {/* Tag content */}
                            <div className="flex flex-col items-center text-center z-10 mb-2">
                              <span className={`
                                font-medium text-xs mb-1 truncate w-full px-1 transition-all
                                ${isSelected 
                                  ? "text-white" 
                                  : isMajor 
                                    ? "text-primary font-bold" 
                                    : isMedium 
                                      ? "text-foreground/90 group-hover:text-primary" 
                                      : "text-foreground/80 group-hover:text-primary/80"
                                }
                              `}>
                                {tag.name}
                              </span>
                            </div>
                            
                            {/* Tag count badge */}
                            <div className={`
                              flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-mono mt-1
                              transition-all duration-300 z-10
                              ${isSelected 
                                ? tagColors[tagCategory].activeBadge
                                : tagColors[tagCategory].badge
                              }
                              ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-200 group-hover:text-primary"}
                            `}>
                              <span className="mr-1">{count}</span>
                              <span className="text-xs opacity-80">{count === 1 ? 'problem' : 'problems'}</span>
            </div>

                            {/* Show filtered count indicator when this tag is selected */}
                            {isSelected && questions.length > 0 && !questionsLoading && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 mt-2">
                                <div 
                                  className="h-full bg-white/70" 
                                  style={{ 
                                    width: `${Math.min(100, (questions.length / count) * 100)}%`,
                                    transition: "width 0.5s ease-in-out"
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Extra effect for popular tags */}
                            {isMajor && !isSelected && (
                              <div className={`absolute -top-1 -right-1 m-2 w-8 h-8 rounded-full flex items-center justify-center ${tagColors[tagCategory].badge} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                <span className="text-xs">🔥</span>
                              </div>
                            )}
                        </div>
                        );
                      })}
                      </div>
                    
                    {/* Show placeholder cards when not expanded */}
                    {!tagsExpanded && tags.length > 12 && (
                      <div className="flex justify-center items-center mt-6">
                        <div className="text-center bg-muted/40 rounded-lg p-4 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map(n => (
                              <div key={n} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${n * 0.2}s` }} />
                            ))}
                        </div>
                          <p className="text-sm text-muted-foreground">{tags.length - 12} more tags available</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTagsExpanded(true)}
                            className="group hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full px-3 ml-2"
                          >
                            View All
                            <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-y-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                  </CardContent>
                </Card>

            {/* Problems Section - Enhanced with Floating Filter Panel */}
            <div className="mt-10 relative">
              {/* Header Info Section */}
              <div className="flex flex-wrap justify-between items-center mb-5">
                <div className="flex flex-col space-y-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Problem Set</h3>
                  <p className="text-sm text-muted-foreground">
                    {questionsLoading ? "Finding the perfect challenges for you..." : 
                     `Showing ${questions.length} of ${questionsTotal} problems`}
                    {tagFilter.length > 0 && ` • Filtered by ${tagFilter.length} ${tagFilter.length === 1 ? 'tag' : 'tags'}`}
                  </p>
                </div>
                
                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                  <Button
                    variant={status === "all" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full h-8 text-xs"
                    onClick={() => setStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={status === "READY" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full h-8 text-xs"
                    onClick={() => setStatus("READY")}
                  >
                    Ready to Solve
                  </Button>
                  <Button
                    variant={status === "DRAFT" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full h-8 text-xs"
                    onClick={() => setStatus("DRAFT")}
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>

              {/* Selected Tags Display */}
              {tagFilter.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-xs text-muted-foreground">Selected Tags:</span>
                  {tagFilter.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge 
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      >
                        {tag.name}
                        <Button
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-primary/20 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle tag selection
                            setTagFilter(prev => prev.filter(t => t !== tag.id));
                            setQuestionsPage(1); // Reset to first page when changing filters
                          }}
                        >
                          ×
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagFilter([]);
                      setQuestionsPage(1); // Reset to first page when changing filters
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {questionsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
                    <p className="text-muted-foreground">Fetching coding problems...</p>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-muted/30">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Code className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No coding problems found</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                    {search || difficulty !== "all" || status !== "all" || tagFilter.length > 0
                      ? "Try adjusting your filters to see more problems"
                      : "Problems will appear here once they're added to the system"}
                  </p>
                  {(search || difficulty !== "all" || status !== "all" || tagFilter.length > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearch("");
                        setDifficulty("all");
                        setStatus("all");
                        setTagFilter([]);
                        setQuestionsPage(1);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
            </div>
              ) : (
                <>
                  {/* Problem Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions.map((q) => {
                      const tags = q.codingQuestion?.tags || [];
                      const difficulty = q.codingQuestion?.difficulty || 'MEDIUM';
                      const isSolved = q.codingQuestion?.userHasSolved || false;
                      const accuracy = q.codingQuestion?.accuracy;
                      const isPopular = (q.codingQuestion?.solvedByCount || 0) > 100;
                      
                      // Dynamic styles based on difficulty
                      const difficultyStyles: {
                        [key: string]: { bg: string; badge: string; hover: string }
                      } = {
                        EASY: {
                          bg: 'border-green-200 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent',
                          badge: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
                          hover: 'hover:border-green-300 hover:shadow-md hover:shadow-green-100/20 dark:hover:shadow-green-900/10'
                        },
                        MEDIUM: {
                          bg: 'border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20 dark:to-transparent',
                          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
                          hover: 'hover:border-yellow-300 hover:shadow-md hover:shadow-yellow-100/20 dark:hover:shadow-yellow-900/10'
                        },
                        HARD: {
                          bg: 'border-red-200 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 dark:to-transparent',
                          badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
                          hover: 'hover:border-red-300 hover:shadow-md hover:shadow-red-100/20 dark:hover:shadow-red-900/10'
                        }
                      };
                      
                      return (
                        <div 
                          key={q.id}
                          onClick={() => window.location.href = `/nexpractice/problem/${q.id}`}
                          className={`
                            border rounded-xl p-5 transition-all duration-200 cursor-pointer
                            ${difficultyStyles[difficulty].bg}
                            ${difficultyStyles[difficulty].hover}
                            transform hover:scale-[1.02] active:scale-[0.98]
                          `}
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${difficultyStyles[difficulty].badge} font-medium`}>
                                {difficulty}
                              </Badge>
                              {isPopular && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary h-6 w-6 rounded-full text-xs">
                                        🔥
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs p-2">Popular Challenge</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {isSolved && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center justify-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 h-6 w-6 rounded-full text-xs">
                                        ✓
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs p-2">You've solved this!</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
            </div>

                            {accuracy != null && (
                          <div className="flex items-center">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={`
                                        text-xs rounded-full px-2 py-1 font-mono
                                        ${accuracy > 70 ? 'bg-green-100/70 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                          accuracy > 40 ? 'bg-yellow-100/70 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                          'bg-red-100/70 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                                      `}>
                                        {accuracy}%
                                    </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="text-xs p-2">
                                      {accuracy}% of students solved this correctly
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                          
                          {/* Problem Title */}
                          <h3 className="font-medium text-lg mb-2 line-clamp-2">{q.name}</h3>
                          
                          {/* Problem Description */}
                          {q.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{q.description}</p>
                          )}
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {tags.slice(0, 3).map((tag: any) => (
                              <Badge 
                                key={tag.id} 
                                variant="outline"
                                className="bg-primary/5 hover:bg-primary/10 text-primary/90 text-[10px] px-2 py-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle tag selection
                                  setTagFilter(prev => 
                                    prev.includes(tag.id) 
                                      ? prev.filter(t => t !== tag.id) 
                                      : [...prev, tag.id]
                                  );
                                  setQuestionsPage(1); // Reset to first page when changing filters
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline"
                                      className="bg-muted/70 text-muted-foreground text-[10px] px-2 py-0.5 cursor-help"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      +{tags.length - 3}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-2">
                                    <div className="max-h-[150px] overflow-y-auto">
                                      {tags.slice(3).map((tag: any) => (
                                        <div 
                                          key={tag.id} 
                                          className="py-1 hover:bg-muted/50 px-2 rounded cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Toggle tag selection
                                            setTagFilter(prev => 
                                              prev.includes(tag.id) 
                                                ? prev.filter(t => t !== tag.id) 
                                                : [...prev, tag.id]
                                            );
                                            setQuestionsPage(1); // Reset to first page when changing filters
                                          }}
                                        >
                                          {tag.name}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          {/* Solved Count */}
                          <div className="mt-4 text-xs text-muted-foreground">
                            Solved by {q.codingQuestion?.solvedByCount || 0} students
                          </div>
                        </div>
                      );
                    })}
                      </div>
                  
                  {/* Legend */}
                  <div className="mt-6 p-3 bg-muted/30 rounded-lg flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-1.5"></span>
                      <span>Easy</span>
                        </div>
                    <div className="flex items-center">
                      <span className="inline-block h-3 w-3 rounded-full bg-yellow-500 mr-1.5"></span>
                      <span>Medium</span>
                        </div>
                    <div className="flex items-center">
                      <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-1.5"></span>
                      <span>Hard</span>
                      </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 h-4 w-4 rounded-full text-[10px] mr-1.5">
                        ✓
                      </span>
                      <span>Solved</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary h-4 w-4 rounded-full text-[10px] mr-1.5">
                        🔥
                      </span>
                      <span>Popular</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pagination Controls */}
            {questionsTotal > 0 && (
              <div className="flex justify-between items-center mt-6 bg-muted/30 py-3 px-4 rounded-xl">
                <div className="text-sm font-medium text-primary/80">
                  {questions.length > 0 && `Page ${questionsPage} of ${Math.ceil(questionsTotal / questionsPerPage)}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hidden sm:flex items-center justify-center"
                    disabled={questionsPage === 1} 
                    onClick={() => setQuestionsPage(1)}
                    title="First Page"
                  >
                    ⟪
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary flex items-center justify-center"
                    disabled={questionsPage === 1} 
                    onClick={() => setQuestionsPage(p => Math.max(1, p - 1))}
                    title="Previous Page"
                  >
                    ⟨
                  </Button>
                  {/* Page Numbers on Desktop */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.ceil(questionsTotal / questionsPerPage)) }).map((_, i) => {
                      const pageNum = i + 1;
                      // Calculate page numbers around the current page
                      let pageToShow = pageNum;
                      if (questionsPage > 3 && Math.ceil(questionsTotal / questionsPerPage) > 5) {
                        pageToShow = questionsPage - 3 + i + 1;
                        if (pageToShow > Math.ceil(questionsTotal / questionsPerPage)) {
                          pageToShow = Math.ceil(questionsTotal / questionsPerPage) - (5 - i - 1);
                        }
                      }
                      return pageToShow <= Math.ceil(questionsTotal / questionsPerPage) ? (
                        <Button
                          key={pageToShow}
                          variant={pageToShow === questionsPage ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 rounded-full ${
                            pageToShow === questionsPage 
                              ? "bg-primary text-white" 
                              : "border-primary/20 text-primary hover:bg-primary/10"
                          }`}
                          onClick={() => setQuestionsPage(pageToShow)}
                        >
                          {pageToShow}
                        </Button>
                      ) : null;
                    })}
                  </div>
                  {/* Mobile Page Indicator */}
                  <span className="px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium sm:hidden">
                    {questionsPage}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary flex items-center justify-center"
                    disabled={questionsPage * questionsPerPage >= questionsTotal} 
                    onClick={() => setQuestionsPage(p => p + 1)}
                    title="Next Page"
                  >
                    ⟩
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hidden sm:flex items-center justify-center"
                    disabled={questionsPage * questionsPerPage >= questionsTotal} 
                    onClick={() => setQuestionsPage(Math.ceil(questionsTotal / questionsPerPage))}
                    title="Last Page"
                  >
                    ⟫
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <ProgressTracker />
            
            {/* Recommended Problems Card */}
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Recommended Problems
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { title: "Merge Intervals", difficulty: "Medium", tag: "Array" },
                    { title: "Binary Tree Level Order Traversal", difficulty: "Medium", tag: "Tree" },
                    { title: "Valid Parentheses", difficulty: "Easy", tag: "Stack" }
                  ].map((problem, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-xs text-muted-foreground">{problem.tag}</div>
                      </div>
                      <Badge className={`${
                        problem.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                        problem.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {problem.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 