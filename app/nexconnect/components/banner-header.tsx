"use client"

import { Bell, MessageCircle, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define a type for particles
interface Particle {
  top: string;
  left: string;
  opacity: number;
  animation: string;
}

export default function BannerHeader() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClient, setIsClient] = useState(false)
  
  // Generate particles only on the client side
  useEffect(() => {
    setIsClient(true)
    
    const newParticles = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.3,
      animation: `float ${Math.random() * 10 + 20}s linear infinite`
    }))
    
    setParticles(newParticles)
  }, [])

  return (
    <div className="relative overflow-hidden z-0 rounded-xl shadow-md">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image 
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
          alt="College campus" 
          fill 
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Background overlay with modern gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-800/90 to-blue-900/80"></div>

      {/* Decorative patterns */}
        <div
        className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

      {/* Particle effect using divs - only rendered on client side */}
      <div className="absolute inset-0 overflow-hidden">
        {isClient && particles.map((particle, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              top: particle.top,
              left: particle.left,
              opacity: particle.opacity,
              animation: particle.animation
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative py-8 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center">
              {/* Logo */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 shadow-lg mr-4 border border-white/20">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  N
                </div>
              </div>

              {/* Brand text */}
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  NexConnect
                  <span className="ml-2 bg-white/10 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider border border-white/20">
                    Campus Edition
                  </span>
                </h1>
                <p className="text-sm text-blue-100 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Connect with 2,457 members from your campus community
                </p>
              </div>
            </div>

            {/* Right side - search and navigation */}
            <div className="flex items-center space-x-2">
              {/* Search bar */}
              <div className={`relative transition-all duration-300 ${searchFocused ? "w-64" : "w-48"}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  className="w-full pl-10 pr-4 py-2 rounded-full border-none bg-white/10 text-white placeholder:text-blue-200 focus-visible:ring-white/30 backdrop-blur-md"
                  placeholder="Search..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>

              {/* Notification icons */}
              <Button variant="ghost" size="icon" className="relative rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                <MessageCircle className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 bg-pink-500 text-[10px]">4</Badge>
              </Button>
              
              <Button variant="ghost" size="icon" className="relative rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 bg-pink-500 text-[10px]">7</Badge>
              </Button>
              
              
            </div>
          </div>

          {/* Floating shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/10 rounded-full -mt-16 -mr-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-600/10 rounded-full -mb-12 blur-xl"></div>
        </div>
      </div>
      
      {/* CSS for floating animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(-5px) translateX(15px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
      `}</style>
    </div>
  )
}
