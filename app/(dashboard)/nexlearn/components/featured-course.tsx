import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, User, CheckCircle, ChevronRight, Play, Code } from "lucide-react"

export default function FeaturedCourse() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-premium hover:shadow-card-hover transition-all duration-300 group">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="absolute inset-0 bg-[url('/pattern-dots.png')] opacity-10"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8">
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
              <Code className="h-20 w-20 text-white" />
            </div>
            <Badge className="bg-blue-500 text-white hover:bg-blue-600 mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
            <div className="text-center">
              <h4 className="text-white text-lg font-medium mb-2">Python Programming</h4>
              <p className="text-blue-100 text-sm max-w-xs text-center">
                Master Python from basics to advanced concepts
              </p>
            </div>
            <Button
              className="mt-6 rounded-full w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 p-0"
              aria-label="Play preview"
            >
              <Play className="h-5 w-5 fill-current" />
            </Button>
          </div>
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              <Star className="h-3 w-3 mr-1 fill-current" /> Bestseller
            </Badge>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Python</Badge>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Bestseller</Badge>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Updated 2025</Badge>
          </div>
          <h3 className="text-2xl font-bold mb-3">Python Programming Masterclass</h3>
          <p className="text-gray-600 mb-4">
            Master Python programming from basics to advanced concepts. Build real-world applications and prepare for a
            career in software development, data science, or AI.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-sm font-medium">John Smith</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-sm">12 weeks</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">4.9</span>
              <span className="text-sm text-gray-500 ml-1">(2,456 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">60+ hours of video</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">15 coding projects</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">Certificate of completion</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
              <span className="text-sm">Lifetime access</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-blue-600">$49.99</span>
            <span className="text-sm text-gray-500 line-through">$199.99</span>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">75% off</span>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-gradient text-white hover:shadow-blue-glow transition-all duration-300 rounded-full group flex-1">
              Enroll Now
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full">
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
