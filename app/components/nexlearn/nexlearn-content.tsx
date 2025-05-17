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

// Course data
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
  {
    id: "2",
    title: "React Architecture Masterclass",
    category: "Programming",
    level: "Intermediate",
    duration: "10 weeks",
    enrolled: 3211,
    rating: 4.9,
    instructor: "David Chen",
    progress: 32,
    icon: Layers,
    color: "bg-blue-500",
    popular: true,
    tags: ["React", "Architecture", "Performance"],
    chapters: 15,
    completedChapters: 10,
    description:
      "Learn to build scalable React applications with advanced state management and performance optimization.",
    image: "/react-course.png",
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    category: "Data Science",
    level: "Beginner",
    duration: "12 weeks",
    enrolled: 5632,
    rating: 4.7,
    instructor: "Maya Patel",
    progress: 25,
    icon: Cpu,
    color: "bg-blue-500",
    popular: false,
    tags: ["Python", "ML", "Data Science"],
    chapters: 18,
    completedChapters: 4,
    description: "A comprehensive introduction to machine learning algorithms and practical applications.",
    image: "/ui-ux-design-concept.png",
  },
  {
    id: "4",
    title: "Critical Thinking & Problem Solving",
    category: "Aptitude",
    level: "Intermediate",
    duration: "6 weeks",
    enrolled: 1876,
    rating: 4.6,
    instructor: "Alex Rivera",
    progress: 0,
    icon: Puzzle,
    color: "bg-blue-500",
    popular: false,
    tags: ["Logic", "Problem Solving", "Critical Thinking"],
    chapters: 9,
    completedChapters: 0,
    description: "Develop essential critical thinking skills and learn structured approaches to problem-solving.",
    image: "/machine-learning-concept.png",
  },
  {
    id: "5",
    title: "Effective Communication Skills",
    category: "Soft Skills",
    level: "Beginner",
    duration: "5 weeks",
    enrolled: 3542,
    rating: 4.8,
    instructor: "Emily Rodriguez",
    progress: 0,
    icon: MessageSquare,
    color: "bg-blue-500",
    popular: true,
    tags: ["Communication", "Presentation", "Interpersonal"],
    chapters: 8,
    completedChapters: 0,
    description:
      "Master the art of clear communication in professional settings and improve your interpersonal skills.",
    image: "/flutter-development.png",
  },
  {
    id: "6",
    title: "Quantitative Aptitude Masterclass",
    category: "Aptitude",
    level: "Intermediate",
    duration: "8 weeks",
    enrolled: 2187,
    rating: 4.7,
    instructor: "Michael Chang",
    progress: 0,
    icon: BarChart2,
    color: "bg-blue-500",
    popular: false,
    tags: ["Mathematics", "Logical Reasoning", "Data Interpretation"],
    chapters: 12,
    completedChapters: 0,
    description:
      "Comprehensive course on quantitative aptitude covering arithmetic, algebra, geometry, and data analysis.",
    image: "/placeholder-jwud3.png",
  },
  {
    id: "7",
    title: "Python for Data Analysis",
    category: "Data Science",
    level: "Intermediate",
    duration: "8 weeks",
    enrolled: 4231,
    rating: 4.8,
    instructor: "Alex Johnson",
    progress: 0,
    icon: BarChart,
    color: "bg-purple-500",
    popular: true,
    tags: ["Python", "Pandas", "Data Analysis"],
    chapters: 14,
    completedChapters: 0,
    description: "Learn how to use Python for data analysis, visualization, and interpretation.",
    image: "/placeholder-43e6s.png",
  },
  {
    id: "8",
    title: "UI/UX Design Principles",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    enrolled: 3120,
    rating: 4.7,
    instructor: "Emma Wilson",
    progress: 0,
    icon: PenTool,
    color: "bg-pink-500",
    popular: true,
    tags: ["UI", "UX", "Design Thinking"],
    chapters: 10,
    completedChapters: 0,
    description: "Master the fundamentals of user interface and user experience design.",
    image: "/ui-design-wireframe.png",
  },
  {
    id: "9",
    title: "Leadership & Team Management",
    category: "Leadership",
    level: "Advanced",
    duration: "7 weeks",
    enrolled: 2340,
    rating: 4.9,
    instructor: "Robert Chen",
    progress: 0,
    icon: Users2,
    color: "bg-indigo-500",
    popular: false,
    tags: ["Leadership", "Management", "Team Building"],
    chapters: 12,
    completedChapters: 0,
    description: "Develop essential leadership skills to effectively manage and inspire teams.",
    image: "/placeholder-y9tny.png",
  },
  {
    id: "10",
    title: "Mobile App Development with Flutter",
    category: "Mobile",
    level: "Intermediate",
    duration: "9 weeks",
    enrolled: 2876,
    rating: 4.6,
    instructor: "Carlos Mendez",
    progress: 0,
    icon: Smartphone,
    color: "bg-orange-500",
    popular: true,
    tags: ["Flutter", "Dart", "Mobile Development"],
    chapters: 15,
    completedChapters: 0,
    description: "Build beautiful, natively compiled applications for mobile from a single codebase.",
    image: "/mobile-app-interface.png",
  },
  {
    id: "11",
    title: "DevOps & CI/CD Pipelines",
    category: "DevOps",
    level: "Advanced",
    duration: "10 weeks",
    enrolled: 1987,
    rating: 4.8,
    instructor: "Jennifer Lee",
    progress: 0,
    icon: Server,
    color: "bg-sky-500",
    popular: false,
    tags: ["DevOps", "CI/CD", "Docker", "Kubernetes"],
    chapters: 16,
    completedChapters: 0,
    description: "Master DevOps practices and build efficient CI/CD pipelines for software delivery.",
    image: "/cloud-infrastructure-diagram.png",
  },
  {
    id: "12",
    title: "SQL & Database Design",
    category: "Databases",
    level: "Intermediate",
    duration: "7 weeks",
    enrolled: 3421,
    rating: 4.7,
    instructor: "Michael Brown",
    progress: 0,
    icon: Database,
    color: "bg-emerald-500",
    popular: true,
    tags: ["SQL", "Database Design", "Normalization"],
    chapters: 12,
    completedChapters: 0,
    description: "Learn database design principles and master SQL for effective data management.",
    image: "/database-schema.png",
  },
]

// Banner slides data
const bannerSlides = [
  {
    id: 1,
    title: "Master In-Demand Coding Skills",
    description:
      "Learn programming, web development, and data science from industry experts. Build real-world projects and advance your tech career.",
    image: "/javascript-code.png",
    category: "Programming",
    icon: Code,
    color: "bg-blue-500",
    cta: "Explore Coding Courses",
    stats: [
      { value: "450+", label: "Coding Courses" },
      { value: "32", label: "Programming Languages" },
      { value: "50K+", label: "Developers Trained" },
    ],
  },
  {
    id: 2,
    title: "Boost Your Aptitude & Analytical Skills",
    description:
      "Enhance your logical reasoning, quantitative aptitude, and problem-solving abilities. Prepare for competitive exams and job interviews.",
    image: "/placeholder-h7g6c.png",
    category: "Aptitude",
    icon: Puzzle,
    color: "bg-purple-500",
    cta: "Discover Aptitude Courses",
    stats: [
      { value: "200+", label: "Aptitude Courses" },
      { value: "5000+", label: "Practice Problems" },
      { value: "85%", label: "Success Rate" },
    ],
  },
  {
    id: 3,
    title: "Develop Essential Soft Skills",
    description:
      "Build communication, leadership, and interpersonal skills that employers value. Stand out in your career with well-rounded professional abilities.",
    image: "/diverse-group.png",
    category: "Soft Skills",
    icon: Users2,
    color: "bg-green-500",
    cta: "Explore Soft Skills Courses",
    stats: [
      { value: "150+", label: "Soft Skills Courses" },
      { value: "24", label: "Industry Experts" },
      { value: "92%", label: "Satisfaction Rate" },
    ],
  },
]

// Enhanced categories with icons and colors
const enhancedCategories = [
  {
    name: "Programming",
    icon: Code,
    count: 45,
    textColor: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    activeBg: "bg-blue-500",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
    description: "Learn programming languages, frameworks, and development techniques.",
  },
  {
    name: "Data Science",
    icon: BarChart,
    count: 32,
    textColor: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    activeBg: "bg-purple-500",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
    description: "Master data analysis, visualization, and machine learning.",
  },
  {
    name: "Design",
    icon: PenTool,
    count: 28,
    textColor: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    borderColor: "border-pink-200 dark:border-pink-800",
    activeBg: "bg-pink-500",
    hoverBg: "hover:bg-pink-50 dark:hover:bg-pink-900/10",
    description: "Learn UI/UX design, graphic design, and creative principles.",
  },
  {
    name: "Aptitude",
    icon: Puzzle,
    count: 24,
    textColor: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    activeBg: "bg-amber-500",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
    description: "Improve logical reasoning, problem-solving, and analytical skills.",
  },
  {
    name: "Soft Skills",
    icon: MessageSquare,
    count: 18,
    textColor: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800",
    activeBg: "bg-green-500",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/10",
    description: "Develop communication, interpersonal, and presentation skills.",
  },
  {
    name: "Leadership",
    icon: Users2,
    count: 15,
    textColor: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    activeBg: "bg-indigo-500",
    hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
    description: "Learn team management, leadership, and organizational skills.",
  },
  {
    name: "Career",
    icon: Briefcase,
    count: 22,
    textColor: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    activeBg: "bg-cyan-500",
    hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-900/10",
    description: "Prepare for job interviews, resume building, and career advancement.",
  },
  {
    name: "AI & ML",
    icon: Brain,
    count: 19,
    textColor: "text-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    activeBg: "bg-rose-500",
    hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-900/10",
    description: "Explore artificial intelligence, machine learning, and deep learning.",
  },
  {
    name: "Web Dev",
    icon: Globe,
    count: 37,
    textColor: "text-teal-500",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    borderColor: "border-teal-200 dark:border-teal-800",
    activeBg: "bg-teal-500",
    hoverBg: "hover:bg-teal-50 dark:hover:bg-teal-900/10",
    description: "Learn frontend, backend, and full-stack web development.",
  },
  {
    name: "Mobile",
    icon: Smartphone,
    count: 26,
    textColor: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    activeBg: "bg-orange-500",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-900/10",
    description: "Build iOS, Android, and cross-platform mobile applications.",
  },
  {
    name: "DevOps",
    icon: Server,
    count: 21,
    textColor: "text-sky-500",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    activeBg: "bg-sky-500",
    hoverBg: "hover:bg-sky-50 dark:hover:bg-sky-900/10",
    description: "Master CI/CD, containerization, and cloud infrastructure.",
  },
  {
    name: "Databases",
    icon: Database,
    count: 18,
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    activeBg: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
    description: "Learn SQL, NoSQL, and database design principles.",
  },
]

// Featured courses by category
const featuredCourses = {
  programming: [
    {
      id: "p1",
      title: "Full-Stack Web Development Bootcamp",
      instructor: "David Chen",
      rating: 4.9,
      students: 12543,
      image: "/placeholder-jwud3.png",
      price: "$89.99",
      tags: ["JavaScript", "React", "Node.js"],
    },
    {
      id: "p2",
      title: "Python for Data Science & Machine Learning",
      instructor: "Maya Patel",
      rating: 4.8,
      students: 9876,
      image: "/ui-ux-design-concept.png",
      price: "$79.99",
      tags: ["Python", "Data Science", "ML"],
    },
    {
      id: "p3",
      title: "Mobile App Development with Flutter",
      instructor: "Carlos Mendez",
      rating: 4.7,
      students: 7654,
      image: "/placeholder-pkvpv.png",
      price: "$69.99",
      tags: ["Flutter", "Dart", "Mobile"],
    },
  ],
  aptitude: [
    {
      id: "a1",
      title: "Logical Reasoning Masterclass",
      instructor: "Michael Chang",
      rating: 4.8,
      students: 8765,
      image: "/placeholder-43e6s.png",
      price: "$59.99",
      tags: ["Logic", "Reasoning", "Problem Solving"],
    },
    {
      id: "a2",
      title: "Quantitative Aptitude for Competitive Exams",
      instructor: "Priya Sharma",
      rating: 4.7,
      students: 6543,
      image: "/placeholder-9169l.png",
      price: "$49.99",
      tags: ["Mathematics", "Quantitative", "Exams"],
    },
    {
      id: "a3",
      title: "Data Interpretation & Analysis",
      instructor: "James Wilson",
      rating: 4.6,
      students: 5432,
      image: "/database-schema.png",
      price: "$54.99",
      tags: ["Data Analysis", "Charts", "Interpretation"],
    },
  ],
  softSkills: [
    {
      id: "s1",
      title: "Effective Business Communication",
      instructor: "Emily Rodriguez",
      rating: 4.9,
      students: 9876,
      image: "/placeholder-fb5kp.png",
      price: "$64.99",
      tags: ["Communication", "Business", "Writing"],
    },
    {
      id: "s2",
      title: "Leadership & Team Management",
      instructor: "Robert Johnson",
      rating: 4.8,
      students: 7654,
      image: "/placeholder-y9tny.png",
      price: "$74.99",
      tags: ["Leadership", "Management", "Teams"],
    },
    {
      id: "s3",
      title: "Public Speaking & Presentation Skills",
      instructor: "Sophia Lee",
      rating: 4.7,
      students: 6543,
      image: "/microphone-concert-stage.png",
      price: "$59.99",
      tags: ["Speaking", "Presentation", "Confidence"],
    },
  ],
}

// Default export
export default function NexLearnContent() {
  const { theme, setTheme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const autoplayRef = useRef(null)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Autoplay for banner slider
  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
      }, 5000)
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [autoplay, bannerSlides.length])

  // Pause autoplay on hover
  const handleSliderMouseEnter = () => setAutoplay(false)
  const handleSliderMouseLeave = () => setAutoplay(true)

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1))
  }

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  // Filter courses based on selected category
  const getCoursesByCategory = (category) => {
    return courses.filter((course) => course.category === category)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Banner Slider Section */}
        <section
          className="mb-8 relative overflow-hidden"
          onMouseEnter={handleSliderMouseEnter}
          onMouseLeave={handleSliderMouseLeave}
        >
          <div className="relative h-[320px] md:h-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md">
            {/* Slider Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-800/80 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-slate-200" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-800/80 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 text-slate-700 dark:text-slate-200" />
            </button>

            {/* Slides */}
            <div className="h-full relative">
              <AnimatePresence mode="wait">
                {bannerSlides.map(
                  (slide, index) =>
                    index === currentSlide && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col md:flex-row"
                      >
                        {/* Content */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                          <Badge className={`${slide.color} text-white border-0 mb-2 self-start`}>
                            <slide.icon className="mr-1 h-3 w-3" /> {slide.category} Courses
                          </Badge>

                          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                            {slide.title}
                          </h1>

                          <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                            {slide.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Button size="sm" className={`${slide.color} hover:opacity-90 text-white h-8 px-3 py-1`}>
                              {slide.cta} <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-200 dark:border-slate-700 h-8 px-3 py-1"
                            >
                              View Curriculum
                            </Button>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-auto">
                            {slide.stats.map((stat, i) => (
                              <div key={i} className="text-center">
                                <div className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                                  {stat.value}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Image */}
                        <div className="hidden md:block w-1/2 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"></div>
                          <Image
                            src={slide.image || "/placeholder.svg"}
                            alt={slide.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </motion.div>
                    ),
                )}
              </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide ? "w-6 bg-blue-500" : "w-1.5 bg-slate-300 dark:bg-slate-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Improved Search Bar */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/30 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Find Your Perfect Course</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Search from thousands of courses and learning paths
                </p>
              </div>

              <div className="w-full md:w-auto flex-1 max-w-2xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-20 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search for courses, topics, skills, or instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Button className="h-8 bg-blue-500 hover:bg-blue-600 text-white">Search</Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Popular:</span>
                  {["JavaScript", "Python", "Data Science", "UI/UX", "Machine Learning"].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Improved Stats Section */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: BookOpen,
                value: "10,000+",
                label: "Courses Available",
                color: "bg-blue-500",
                description: "Across 12 categories",
              },
              {
                icon: Users,
                value: "5M+",
                label: "Active Students",
                color: "bg-purple-500",
                description: "From 150+ countries",
              },
              {
                icon: Star,
                value: "4.8",
                label: "Average Rating",
                color: "bg-amber-500",
                description: "From 2M+ reviews",
              },
              {
                icon: Award,
                value: "1,200+",
                label: "Expert Instructors",
                color: "bg-green-500",
                description: "Industry professionals",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className={`${stat.color} p-2.5 rounded-lg mr-3`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{stat.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Explorer */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                Browse Categories
                <Badge className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0">
                  {enhancedCategories.length}
                </Badge>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Explore our course categories and find the perfect match for your learning goals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-slate-700 gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 border-slate-200 dark:border-slate-700">
                View All <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <Suspense
            fallback={<div className="h-96 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>}
          >
            <CategoryExplorer />
          </Suspense>
        </section>

        {/* CTA Section */}
        <section className="mb-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-8 md:p-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 border-0 mb-4">
                Get Started Today
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to Advance Your Career?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
                Join thousands of learners who are building technical skills, improving aptitude, and developing
                professional competencies with NexLearn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Create Free Account</Button>
                <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                  Explore All Courses
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
