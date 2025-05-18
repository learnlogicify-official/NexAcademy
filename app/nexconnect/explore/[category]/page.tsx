"use client"

import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

const categoryInfo: Record<string, { title: string; description: string; color: string; image: string }> = {
  "academic": {
    title: "Academic Groups",
    description: "Connect with study groups and academic resources",
    color: "from-blue-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  "events": {
    title: "Campus Events",
    description: "Discover what's happening around campus",
    color: "from-emerald-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  "clubs": {
    title: "Student Clubs",
    description: "Connect with clubs and organizations",
    color: "from-orange-500 to-amber-600",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  "local": {
    title: "Local Spots",
    description: "Popular places around campus",
    color: "from-red-500 to-pink-600",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  "trending": {
    title: "Trending Topics",
    description: "See what's trending on campus",
    color: "from-purple-500 to-violet-600",
    image: "https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  "global": {
    title: "Global Connect",
    description: "Connect with students worldwide",
    color: "from-cyan-500 to-blue-600",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [searchTerm, setSearchTerm] = useState("");
  
  // Default values if category is not found
  const categoryData = categoryInfo[category] || {
    title: "Explore Category",
    description: "Discover content in this category",
    color: "from-gray-500 to-gray-600",
    image: "https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/nexconnect/explore" className="flex items-center text-blue-600 mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Explore
        </Link>
        
        <Card className="border-none shadow-lg overflow-hidden mb-6">
          <div className="relative h-48">
            {/* Category image */}
            <div className="absolute inset-0">
              <Image 
                src={categoryData.image} 
                alt={categoryData.title} 
                fill 
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${categoryData.color} opacity-80`}></div>
            </div>
            
            {/* Content */}
            <div className="relative p-6 h-full flex flex-col justify-end text-white">
              <h1 className="font-bold text-3xl mb-2">{categoryData.title}</h1>
              <p className="text-white/90 max-w-xl">{categoryData.description}</p>
            </div>
          </div>
        </Card>
        
        {/* Search bar */}
        <Card className="p-4 border-none shadow-md rounded-xl">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search in ${categoryData.title}...`}
                className="pl-10 border-none bg-gray-100 text-gray-900 focus-visible:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Content placeholder - in a real app, you would fetch category-specific content */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6 border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-20 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
              <p className="text-gray-500">Content item {i} for {categoryData.title}</p>
            </div>
            <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
          </Card>
        ))}
      </div>
    </div>
  );
} 