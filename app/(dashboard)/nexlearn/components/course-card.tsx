import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Star, ChevronRight, Code, Database, Palette, TrendingUp, BarChart, Server } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  title: string
  description: string
  category: string
  level: string
  duration: string
  instructor: string
  image?: string // Made optional since we're using icons
  rating?: number
  students?: number
  featured?: boolean
}

export default function CourseCard({
  title,
  description,
  category,
  level,
  duration,
  instructor,
  rating = 4.5,
  students = 1000,
  featured = false,
}: CourseCardProps) {
  // Function to get the appropriate icon based on category
  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case "development":
        return <Code className="h-12 w-12 text-white" />
      case "data science":
        return <Database className="h-12 w-12 text-white" />
      case "design":
        return <Palette className="h-12 w-12 text-white" />
      case "marketing":
        return <TrendingUp className="h-12 w-12 text-white" />
      case "business":
        return <BarChart className="h-12 w-12 text-white" />
      case "it & software":
        return <Server className="h-12 w-12 text-white" />
      default:
        return <Code className="h-12 w-12 text-white" />
    }
  }

  // Function to get background gradient based on category
  const getCategoryBackground = () => {
    switch (category.toLowerCase()) {
      case "development":
        return "from-blue-500 to-blue-700"
      case "data science":
        return "from-purple-500 to-purple-700"
      case "design":
        return "from-pink-500 to-pink-700"
      case "marketing":
        return "from-green-500 to-green-700"
      case "business":
        return "from-amber-500 to-amber-700"
      case "it & software":
        return "from-cyan-500 to-cyan-700"
      default:
        return "from-blue-500 to-blue-700"
    }
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-card-hover group border-0 bg-white shadow-premium rounded-xl">
      {featured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
            <Star className="h-3 w-3 mr-1 fill-current" /> Featured
          </Badge>
        </div>
      )}
      <div className="aspect-video w-full overflow-hidden relative bg-gradient-to-br flex items-center justify-center p-8 group-hover:scale-[1.02] transition-transform duration-300 ease-out">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryBackground()}`}></div>
        <div className="absolute inset-0 bg-[url('/pattern-dots.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            {getCategoryIcon()}
          </div>
          <Badge className="bg-white/30 backdrop-blur-sm text-white hover:bg-white/40">{category}</Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-3 w-3" />
            {duration}
          </div>
          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="ml-1 font-medium">{rating}</span>
              <span className="text-gray-500 ml-1">({students.toLocaleString()})</span>
            </div>
          </div>
        </div>
        <Link href="#" className="group/title">
          <h3 className="text-xl font-bold mt-2 group-hover/title:text-blue-600 transition-colors">{title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-500 line-clamp-2 mb-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <User className="mr-1 h-3 w-3" />
          <span>{instructor}</span>
          <span className="mx-2">•</span>
          <span>{level}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-blue-600">$49.99</span>
          <span className="text-sm text-gray-500 line-through ml-2">$199.99</span>
        </div>
        <Button className="bg-blue-gradient text-white hover:shadow-blue-glow transition-all duration-300 rounded-full group">
          Enroll
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
