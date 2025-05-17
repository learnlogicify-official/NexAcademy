"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Code,
  Star,
  Users,
  BarChart,
  Layers,
  Cpu,
  PenTool,
  ArrowUpRight,
  Search,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  MessageSquare,
  BarChart2,
  Puzzle,
  Users2,
  BookOpen,
  Award,
  Brain,
  Filter,
  Globe,
  Smartphone,
  Server,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import CategoryExplorer from "@/components/category-explorer"

// Course data - moved from the original file
// ... (for a shorter implementation, include only the first few courses)
const courses = [
  {
    id: "1",
    title: "Advanced JavaScript Patterns",
    category: "Programming",
    level: "Advanced",
    duration: "8 weeks",
    enrolled: 2453,
    rating: 4.8,
    instructor: "Sarah Johnson",
    progress: 65,
    icon: Code,
    color: "bg-blue-500",
    popular: true,
    tags: ["JavaScript", "Design Patterns", "Performance"],
    chapters: 12,
    completedChapters: 0,
    description: "Master advanced JavaScript patterns and techniques used by senior developers at top tech companies.",
    image: "/javascript-course.png",
  },
  // Add more courses as needed
]

// Main component for the NexLearn page
export default function NexLearnPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeSlide, setActiveSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const autoplayTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme || "light"
  const isDark = theme === "dark"

  const categories = ["All", "Programming", "Data Science", "Aptitude", "Soft Skills", "Leadership", "Mobile", "DevOps"]

  // Get courses for active category
  const filteredCourses = activeCategory === "All" 
    ? courses 
    : courses.filter(course => course.category === activeCategory)

  // Autoplay logic
  useEffect(() => {
    if (autoplay) {
      autoplayTimeRef.current = setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % 3)
      }, 5000)
    }
    
    return () => {
      if (autoplayTimeRef.current) {
        clearTimeout(autoplayTimeRef.current)
      }
    }
  }, [autoplay, activeSlide])

  const handleSliderMouseEnter = () => setAutoplay(false)
  const handleSliderMouseLeave = () => setAutoplay(true)

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + 3) % 3)
  }

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % 3)
  }

  const getCoursesByCategory = (category: string) => {
    return courses.filter(course => course.category === category).length
  }

  // Main JSX
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Welcome to <span className="text-blue-600 dark:text-blue-400">NexLearn</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-3xl">
            Elevate your skills with curated courses designed to help you excel in technical interviews and your career.
          </p>

          {/* Featured courses slider */}
          <div 
            className="relative overflow-hidden rounded-xl"
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
          >
            <div className="flex">
              <AnimatePresence initial={false} custom={activeSlide}>
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="min-w-full"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ 
                      opacity: activeSlide === index ? 1 : 0,
                      x: activeSlide === index ? 0 : activeSlide > index ? -100 : 100,
                      scale: activeSlide === index ? 1 : 0.9,
                    }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: activeSlide === index ? 'block' : 'none' }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-8 md:p-12 rounded-xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mt-20 -mr-20"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -mb-32 -ml-32"></div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-2/3">
                          <Badge className="bg-white/20 text-white mb-4 backdrop-blur-sm">Featured Course</Badge>
                          <h2 className="text-2xl md:text-3xl font-bold mb-3">
                            {index === 0 ? "Advanced JavaScript Patterns" : 
                             index === 1 ? "React Architecture Masterclass" : 
                             "Python for Data Analysis"}
                          </h2>
                          <p className="mb-6 text-white/80 max-w-xl">
                            {index === 0 ? "Master advanced JavaScript patterns and techniques used by senior developers at top tech companies." : 
                             index === 1 ? "Learn to build scalable React applications with advanced state management and performance optimization." : 
                             "Learn how to use Python for data analysis, visualization, and interpretation."}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <Button className="bg-white text-blue-600 hover:bg-blue-50">
                              Enroll Now
                            </Button>
                            <Button variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20">
                              Learn More <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="md:w-1/3 relative h-48 md:h-64 w-full md:w-auto rounded-lg overflow-hidden">
                          <Image 
                            src={index === 0 ? "/javascript-course.png" : 
                                 index === 1 ? "/react-course.png" : 
                                 "/placeholder-43e6s.png"} 
                            alt="Course thumbnail" 
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Slider controls */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
            
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((index) => (
                <button 
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === index ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                  onClick={() => setActiveSlide(index)}
                ></button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Browse by category section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse by Category</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  activeCategory === category
                    ? "border-blue-200 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800"
                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                  activeCategory === category ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                }`}>
                  {category === "Programming" ? <Code className="h-5 w-5" /> :
                   category === "Data Science" ? <BarChart className="h-5 w-5" /> :
                   category === "Aptitude" ? <Brain className="h-5 w-5" /> :
                   category === "Soft Skills" ? <MessageSquare className="h-5 w-5" /> :
                   category === "Leadership" ? <Users2 className="h-5 w-5" /> :
                   category === "Mobile" ? <Smartphone className="h-5 w-5" /> :
                   category === "DevOps" ? <Server className="h-5 w-5" /> :
                   <BookOpen className="h-5 w-5" />}
                </div>
                <span className={`text-sm font-medium ${
                  activeCategory === category ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-slate-200"
                }`}>
                  {category}
                </span>
                {category !== "All" && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {getCoursesByCategory(category)} courses
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
        
        {/* Course listings section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeCategory === "All" ? "All Courses" : `${activeCategory} Courses`}
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={course.image || "/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.popular && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${course.color} text-white`}>
                      {course.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                      <Star className="fill-current h-4 w-4" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Briefcase className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolled.toLocaleString()} enrolled</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {course.duration} • {course.chapters} chapters
                    </div>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      Start Learning
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Category explorer */}
        <section className="mb-12">
          <CategoryExplorer />
        </section>
      </div>
    </div>
  )
} 