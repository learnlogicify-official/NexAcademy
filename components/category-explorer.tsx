"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code,
  Database,
  Palette,
  Brain,
  Smartphone,
  Cloud,
  ChevronRight,
  Filter,
  ArrowRight,
  Star,
  Clock,
  Users,
  TrendingUp,
  BookOpen,
  Layers,
  Zap,
  BarChart,
  MessageSquare,
  Globe,
  Server,
  Lightbulb,
  ExternalLink,
  Play,
  CheckCircle,
  Award,
  LayoutGrid,
  LayoutList,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

// Category data
const categories = [
  {
    id: "programming",
    name: "Programming",
    icon: Code,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    courses: 42,
    description: "Learn coding languages, frameworks, and software development practices.",
  },
  {
    id: "data",
    name: "Data Science",
    icon: Database,
    color: "bg-purple-500",
    textColor: "text-purple-500",
    borderColor: "border-purple-500",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
    courses: 38,
    description: "Master data analysis, visualization, and statistical modeling techniques.",
  },
  {
    id: "design",
    name: "UI/UX Design",
    icon: Palette,
    color: "bg-pink-500",
    textColor: "text-pink-500",
    borderColor: "border-pink-500",
    lightBg: "bg-pink-50 dark:bg-pink-900/20",
    courses: 29,
    description: "Create beautiful interfaces and enhance user experience with design principles.",
  },
  {
    id: "ai",
    name: "AI & ML",
    icon: Brain,
    color: "bg-green-500",
    textColor: "text-green-500",
    borderColor: "border-green-500",
    lightBg: "bg-green-50 dark:bg-green-900/20",
    courses: 35,
    description: "Explore artificial intelligence, machine learning algorithms, and neural networks.",
  },
  {
    id: "mobile",
    name: "Mobile Dev",
    icon: Smartphone,
    color: "bg-orange-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-500",
    lightBg: "bg-orange-50 dark:bg-orange-900/20",
    courses: 31,
    description: "Build native and cross-platform mobile applications for iOS and Android.",
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    icon: Cloud,
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    borderColor: "border-cyan-500",
    lightBg: "bg-cyan-50 dark:bg-cyan-900/20",
    courses: 27,
    description: "Deploy, scale, and manage applications in cloud environments.",
  },
]

// Course data
const coursesByCategory = {
  programming: [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      icon: Code,
      rating: 4.8,
      reviews: 1245,
      level: "Beginner",
      duration: "8 weeks",
      popular: true,
      students: 12500,
      description: "Master the basics of JavaScript programming language and DOM manipulation.",
      enrolled: true,
      progress: 65,
      lastAccessed: "2 days ago",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      icon: Layers,
      rating: 4.9,
      reviews: 876,
      level: "Advanced",
      duration: "10 weeks",
      popular: true,
      students: 8760,
      description: "Learn advanced React patterns, hooks, and state management techniques.",
      enrolled: true,
      progress: 32,
      lastAccessed: "Yesterday",
    },
    {
      id: 3,
      title: "Full-Stack Web Development",
      icon: Globe,
      rating: 4.7,
      reviews: 932,
      level: "Intermediate",
      duration: "12 weeks",
      popular: false,
      students: 9320,
      description: "Build complete web applications with frontend and backend technologies.",
      enrolled: false,
    },
    {
      id: 4,
      title: "TypeScript Masterclass",
      icon: Code,
      rating: 4.6,
      reviews: 654,
      level: "Intermediate",
      duration: "6 weeks",
      popular: false,
      students: 6540,
      description: "Enhance your JavaScript applications with TypeScript's type system.",
      enrolled: false,
    },
  ],
  data: [
    {
      id: 5,
      title: "SQL for Data Analysis",
      icon: Database,
      rating: 4.5,
      reviews: 789,
      level: "Beginner",
      duration: "5 weeks",
      popular: true,
      students: 7890,
      description: "Learn SQL fundamentals for effective data querying and analysis.",
      enrolled: true,
      progress: 100,
      lastAccessed: "1 week ago",
      completed: true,
    },
    {
      id: 6,
      title: "Data Visualization with D3.js",
      icon: BarChart,
      rating: 4.7,
      reviews: 543,
      level: "Intermediate",
      duration: "7 weeks",
      popular: false,
      students: 5430,
      description: "Create interactive data visualizations for the web using D3.js.",
      enrolled: false,
    },
    {
      id: 7,
      title: "Big Data Processing",
      icon: Database,
      rating: 4.8,
      reviews: 421,
      level: "Advanced",
      duration: "9 weeks",
      popular: true,
      students: 4210,
      description: "Process and analyze large datasets using distributed computing frameworks.",
      enrolled: false,
    },
  ],
  design: [
    {
      id: 8,
      title: "UI Design Principles",
      icon: Palette,
      rating: 4.9,
      reviews: 1032,
      level: "Beginner",
      duration: "6 weeks",
      popular: true,
      students: 10320,
      description: "Learn fundamental principles of effective user interface design.",
      enrolled: true,
      progress: 78,
      lastAccessed: "3 days ago",
    },
    {
      id: 9,
      title: "Advanced UX Research",
      icon: Lightbulb,
      rating: 4.7,
      reviews: 687,
      level: "Advanced",
      duration: "8 weeks",
      popular: false,
      students: 6870,
      description: "Master user experience research methods and usability testing.",
      enrolled: false,
    },
    {
      id: 10,
      title: "Design Systems",
      icon: Layers,
      rating: 4.8,
      reviews: 542,
      level: "Intermediate",
      duration: "7 weeks",
      popular: true,
      students: 5420,
      description: "Create and maintain scalable design systems for product teams.",
      enrolled: false,
    },
  ],
  ai: [
    {
      id: 11,
      title: "Machine Learning Basics",
      icon: Brain,
      rating: 4.6,
      reviews: 876,
      level: "Beginner",
      duration: "8 weeks",
      popular: true,
      students: 8760,
      description: "Introduction to machine learning algorithms and applications.",
      enrolled: true,
      progress: 25,
      lastAccessed: "5 days ago",
    },
    {
      id: 12,
      title: "Deep Learning with PyTorch",
      icon: Zap,
      rating: 4.9,
      reviews: 654,
      level: "Advanced",
      duration: "10 weeks",
      popular: true,
      students: 6540,
      description: "Build neural networks and deep learning models with PyTorch.",
      enrolled: false,
    },
    {
      id: 13,
      title: "Natural Language Processing",
      icon: MessageSquare,
      rating: 4.7,
      reviews: 543,
      level: "Intermediate",
      duration: "9 weeks",
      popular: false,
      students: 5430,
      description: "Process and analyze text data using NLP techniques.",
      enrolled: false,
    },
  ],
  mobile: [
    {
      id: 14,
      title: "iOS Development with Swift",
      icon: Smartphone,
      rating: 4.8,
      reviews: 765,
      level: "Intermediate",
      duration: "10 weeks",
      popular: true,
      students: 7650,
      description: "Build native iOS applications using Swift and UIKit.",
      enrolled: false,
    },
    {
      id: 15,
      title: "Flutter App Development",
      icon: Smartphone,
      rating: 4.7,
      reviews: 654,
      level: "Beginner",
      duration: "8 weeks",
      popular: true,
      students: 6540,
      description: "Create cross-platform mobile apps with Flutter framework.",
      enrolled: true,
      progress: 12,
      lastAccessed: "1 day ago",
    },
    {
      id: 16,
      title: "React Native Masterclass",
      icon: Smartphone,
      rating: 4.9,
      reviews: 543,
      level: "Advanced",
      duration: "12 weeks",
      popular: false,
      students: 5430,
      description: "Develop mobile applications for iOS and Android using React Native.",
      enrolled: false,
    },
  ],
  cloud: [
    {
      id: 17,
      title: "AWS Solutions Architect",
      icon: Cloud,
      rating: 4.9,
      reviews: 876,
      level: "Advanced",
      duration: "12 weeks",
      popular: true,
      students: 8760,
      description: "Design and deploy scalable systems on Amazon Web Services.",
      enrolled: false,
    },
    {
      id: 18,
      title: "Docker & Kubernetes",
      icon: Server,
      rating: 4.8,
      reviews: 765,
      level: "Intermediate",
      duration: "8 weeks",
      popular: true,
      students: 7650,
      description: "Containerize applications and orchestrate them with Kubernetes.",
      enrolled: true,
      progress: 45,
      lastAccessed: "4 days ago",
    },
    {
      id: 19,
      title: "Cloud Security Fundamentals",
      icon: Cloud,
      rating: 4.7,
      reviews: 543,
      level: "Beginner",
      duration: "6 weeks",
      popular: false,
      students: 5430,
      description: "Learn essential security practices for cloud environments.",
      enrolled: false,
    },
  ],
}

export default function CategoryExplorer() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDescription, setShowDescription] = useState<string | null>(null)
  const [showEnrolled, setShowEnrolled] = useState(false)
  const [filters, setFilters] = useState({
    level: [] as string[],
    duration: [] as string[],
    popularity: false,
    minRating: 0,
  })
  const [showFilters, setShowFilters] = useState(false)

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)
  const courses = coursesByCategory[selectedCategory as keyof typeof coursesByCategory]

  const toggleLevelFilter = (level: string) => {
    setFilters((prev) => {
      if (prev.level.includes(level)) {
        return { ...prev, level: prev.level.filter((l) => l !== level) }
      } else {
        return { ...prev, level: [...prev.level, level] }
      }
    })
  }

  const toggleDurationFilter = (duration: string) => {
    setFilters((prev) => {
      if (prev.duration.includes(duration)) {
        return { ...prev, duration: prev.duration.filter((d) => d !== duration) }
      } else {
        return { ...prev, duration: [...prev.duration, duration] }
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      level: [],
      duration: [],
      popularity: false,
      minRating: 0,
    })
  }

  const filteredCourses = courses
    .filter((course) => (showEnrolled ? course.enrolled : true))
    .filter((course) => (filters.level.length > 0 ? filters.level.includes(course.level) : true))
    .filter((course) => (filters.duration.length > 0 ? filters.duration.includes(course.duration) : true))
    .filter((course) => (filters.popularity ? course.popular : true))
    .filter((course) => course.rating >= filters.minRating)

  // Get unique levels and durations for filter options
  const uniqueLevels = Array.from(new Set(courses.map((course) => course.level)))
  const uniqueDurations = Array.from(new Set(courses.map((course) => course.duration)))

  const activeFilterCount =
    filters.level.length + filters.duration.length + (filters.popularity ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Category Selector - Compact Tabs */}
      <div className="relative border-b border-slate-200 dark:border-slate-800">
        <div className="flex overflow-x-auto py-2 px-2 gap-1 no-scrollbar">
          {categories.map((category) => (
            <TooltipProvider key={category.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    onMouseEnter={() => setShowDescription(category.id)}
                    onMouseLeave={() => setShowDescription(null)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all text-sm",
                      selectedCategory === category.id
                        ? `${category.color} text-white font-medium`
                        : `${category.lightBg} ${category.textColor} hover:bg-opacity-80`,
                    )}
                  >
                    <category.icon className="w-3.5 h-3.5" />
                    <span>{category.name}</span>
                    {selectedCategory === category.id && (
                      <Badge
                        variant="outline"
                        className="ml-1 bg-white/20 text-white border-white/10 text-xs py-0 px-1.5"
                      >
                        {category.courses}
                      </Badge>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("p-1 rounded-md", category.color)}>
                        <category.icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {category.courses} courses
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{category.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Category Description (shows when hovering over a tab) */}
        <AnimatePresence>
          {showDescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700"
            >
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {categories.find((cat) => cat.id === showDescription)?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Course Display Area */}
      <div className="p-4">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {selectedCategoryData && (
              <>
                <div className={cn("p-1.5 rounded-md", selectedCategoryData.color)}>
                  <selectedCategoryData.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">{selectedCategoryData.name}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{courses.length} courses</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showEnrolled ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-1 h-7 text-xs",
                showEnrolled ? "bg-blue-500 hover:bg-blue-600 text-white" : "border-slate-200 dark:border-slate-700",
              )}
              onClick={() => setShowEnrolled(!showEnrolled)}
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">My Courses</span>
            </Button>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant={activeFilterCount > 0 ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-1 h-7 text-xs relative",
                    activeFilterCount > 0
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "border-slate-200 dark:border-slate-700",
                  )}
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-white text-blue-500 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Level filter */}
                  <div>
                    <h5 className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-400">Level</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueLevels.map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${level}`}
                            checked={filters.level.includes(level)}
                            onCheckedChange={() => toggleLevelFilter(level)}
                          />
                          <label htmlFor={`level-${level}`} className="text-xs cursor-pointer">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Duration filter */}
                  <div>
                    <h5 className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-400">Duration</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueDurations.map((duration) => (
                        <div key={duration} className="flex items-center space-x-2">
                          <Checkbox
                            id={`duration-${duration}`}
                            checked={filters.duration.includes(duration)}
                            onCheckedChange={() => toggleDurationFilter(duration)}
                          />
                          <label htmlFor={`duration-${duration}`} className="text-xs cursor-pointer">
                            {duration}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popularity filter */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="popularity"
                        checked={filters.popularity}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({ ...prev, popularity: checked as boolean }))
                        }
                      />
                      <label htmlFor="popularity" className="text-xs cursor-pointer flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1 text-amber-500" /> Popular courses only
                      </label>
                    </div>
                  </div>

                  {/* Rating filter */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-medium text-slate-500 dark:text-slate-400">Minimum Rating</h5>
                      <span className="text-xs font-medium">
                        {filters.minRating > 0 ? filters.minRating.toFixed(1) : "Any"}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0]}
                      value={[filters.minRating]}
                      max={5}
                      step={0.1}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, minRating: value[0] }))}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Any</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-0.5" />
                        <span>5.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(false)} className="text-xs h-7">
                      Close
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-7 bg-blue-500 hover:bg-blue-600"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-7 text-xs border-slate-200 dark:border-slate-700"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <>
                  <LayoutList className="w-3 h-3" />
                  <span className="hidden sm:inline">List</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3 h-3" />
                  <span className="hidden sm:inline">Grid</span>
                </>
              )}
            </Button>
            <Button variant="default" size="sm" className={cn("gap-1 h-7 text-xs", selectedCategoryData?.color)}>
              View All
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Selected Category Description */}
        {selectedCategoryData && (
          <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">{selectedCategoryData.description}</p>
          </div>
        )}

        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">Active filters:</span>

            {filters.level.map((level) => (
              <Badge
                key={`level-${level}`}
                variant="secondary"
                className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => toggleLevelFilter(level)}
              >
                <BookOpen className="w-3 h-3" /> {level}
                <X className="w-3 h-3" />
              </Badge>
            ))}

            {filters.duration.map((duration) => (
              <Badge
                key={`duration-${duration}`}
                variant="secondary"
                className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => toggleDurationFilter(duration)}
              >
                <Clock className="w-3 h-3" /> {duration}
                <X className="w-3 h-3" />
              </Badge>
            ))}

            {filters.popularity && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, popularity: false }))}
              >
                <TrendingUp className="w-3 h-3" /> Popular
                <X className="w-3 h-3" />
              </Badge>
            )}

            {filters.minRating > 0 && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
              >
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {filters.minRating.toFixed(1)}+
                <X className="w-3 h-3" />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Empty state for filtered courses */}
        {filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              {showEnrolled ? (
                <BookOpen className="w-8 h-8 text-slate-400" />
              ) : (
                <Filter className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {showEnrolled ? "No Enrolled Courses" : "No Matching Courses"}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              {showEnrolled
                ? "You haven't enrolled in any courses in this category yet. Browse our catalog to find courses that interest you."
                : "No courses match your current filter criteria. Try adjusting your filters or browse all courses."}
            </p>
            <Button
              variant="outline"
              className="border-slate-200 dark:border-slate-700"
              onClick={() => {
                if (activeFilterCount > 0) clearFilters()
                if (showEnrolled) setShowEnrolled(false)
              }}
            >
              {activeFilterCount > 0 ? "Clear Filters" : "Browse All Courses"}
            </Button>
          </div>
        )}

        {/* Courses Grid/List */}
        {filteredCourses.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + viewMode + (showEnrolled ? "enrolled" : "all")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  : "flex flex-col gap-3",
              )}
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className={cn("transition-all", viewMode === "list" && "flex")}
                >
                  {/* Course Card */}
                  {viewMode === "grid" ? (
                    // Grid View - Card with colored background
                    <div
                      className={cn(
                        "rounded-lg overflow-hidden h-full border border-slate-200 dark:border-slate-800",
                        "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800",
                        "hover:shadow-md transition-shadow",
                        course.enrolled && "ring-1 ring-blue-500/30 dark:ring-blue-500/20",
                      )}
                    >
                      {/* Course header with icon */}
                      <div
                        className={cn("h-24 relative flex items-center justify-center", selectedCategoryData?.lightBg)}
                      >
                        <div className={cn("absolute inset-0 opacity-10 bg-pattern-grid")}></div>
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            selectedCategoryData?.color,
                          )}
                        >
                          <course.icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Status badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                          {course.popular && !course.enrolled && (
                            <Badge className={cn(selectedCategoryData?.color)}>
                              <TrendingUp className="w-3 h-3 mr-1" /> Popular
                            </Badge>
                          )}

                          {course.enrolled && (
                            <Badge className="bg-blue-500 text-white">
                              <BookOpen className="w-3 h-3 mr-1" /> Enrolled
                            </Badge>
                          )}

                          {course.completed && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </Badge>
                          )}
                        </div>

                        {/* Continue button for enrolled courses */}
                        {course.enrolled && !course.completed && (
                          <div className="absolute bottom-2 right-2">
                            <Button
                              size="sm"
                              className="h-7 px-2 py-1 bg-white/90 hover:bg-white text-slate-900 gap-1 text-xs"
                            >
                              <Play className="w-3 h-3 fill-current" /> Continue
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Course content */}
                      <div className="p-4">
                        {/* Progress bar for enrolled courses */}
                        {course.enrolled && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Progress</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn(
                                  "h-full rounded-full",
                                  course.progress === 100
                                    ? "bg-green-500"
                                    : course.progress > 50
                                      ? "bg-blue-500"
                                      : "bg-blue-400",
                                )}
                              />
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Last accessed: {course.lastAccessed}
                            </div>
                          </div>
                        )}

                        <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1 mb-1">{course.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {course.description}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                          <span>{course.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{course.reviews} reviews</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                          >
                            <Clock className="w-3 h-3 mr-1" /> {course.duration}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                          >
                            <BookOpen className="w-3 h-3 mr-1" /> {course.level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <Users className="w-3 h-3 text-slate-400 mr-1" />
                            <span className="text-slate-500 dark:text-slate-400">
                              {course.students.toLocaleString()} students
                            </span>
                          </div>

                          {/* Different button based on enrollment status */}
                          {course.enrolled ? (
                            course.completed ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 p-0 font-normal text-green-500 dark:text-green-400"
                              >
                                Certificate <Award className="w-3 h-3 ml-1" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn("h-6 p-0 font-normal", selectedCategoryData?.textColor)}
                              >
                                Resume <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn("h-6 p-0 font-normal", selectedCategoryData?.textColor)}
                            >
                              Enroll <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div
                      className={cn(
                        "flex w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow",
                        course.enrolled && "ring-1 ring-blue-500/30 dark:ring-blue-500/20",
                      )}
                    >
                      {/* Icon section */}
                      <div
                        className={cn(
                          "w-16 flex-shrink-0 flex items-center justify-center",
                          selectedCategoryData?.lightBg,
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            selectedCategoryData?.color,
                          )}
                        >
                          <course.icon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="p-3 flex-1">
                        {/* Progress bar for enrolled courses in list view */}
                        {course.enrolled && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Progress</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn(
                                  "h-full rounded-full",
                                  course.progress === 100
                                    ? "bg-green-500"
                                    : course.progress > 50
                                      ? "bg-blue-500"
                                      : "bg-blue-400",
                                )}
                              />
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Last accessed: {course.lastAccessed}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-slate-900 dark:text-white">{course.title}</h4>
                          <div className="flex gap-1">
                            {course.enrolled && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                <BookOpen className="w-3 h-3 mr-1" /> Enrolled
                              </Badge>
                            )}
                            {course.completed && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" /> Completed
                              </Badge>
                            )}
                            {course.popular && !course.enrolled && (
                              <Badge className={cn("text-xs", selectedCategoryData?.color)}>
                                <TrendingUp className="w-3 h-3 mr-1" /> Hot
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center mt-1 text-xs text-slate-600 dark:text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                          <span>{course.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{course.reviews} reviews</span>
                          <span className="mx-1">•</span>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
                          >
                            {course.level}
                          </Badge>
                          <span className="mx-1">•</span>
                          <Clock className="w-3 h-3 text-slate-400 mr-1" />
                          <span>{course.duration}</span>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex items-center text-xs">
                            <Users className="w-3 h-3 text-slate-400 mr-1" />
                            <span className="text-slate-500 dark:text-slate-400">
                              {course.students.toLocaleString()} students
                            </span>
                          </div>

                          {/* Different button based on enrollment status */}
                          {course.enrolled ? (
                            <div className="flex gap-2">
                              {!course.completed && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white gap-1 text-xs"
                                >
                                  <Play className="w-3 h-3 fill-current" /> Continue
                                </Button>
                              )}
                              {course.completed ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 py-1 text-green-500 border-green-200 dark:border-green-800/30 gap-1 text-xs"
                                >
                                  Certificate <Award className="w-3 h-3 ml-1" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn("h-6 p-0 font-normal", selectedCategoryData?.textColor)}
                                >
                                  Details <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn("h-6 p-0 font-normal", selectedCategoryData?.textColor)}
                            >
                              View details <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* View more button */}
        {filteredCourses.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mx-auto h-7 text-xs border-slate-200 dark:border-slate-700"
            >
              {isExpanded ? "Show Less" : "Load More Courses"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
