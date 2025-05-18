"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useState } from "react"

const initialUsers = [
    {
      id: 1,
    name: "Emma Rodriguez",
    role: "Professor",
    department: "Computer Science",
    interests: ["AI", "Data Science", "Ethics"],
    mutualConnections: 12,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true
    },
    {
      id: 2,
    name: "Michael Chen",
    role: "Student",
    department: "Mechanical Engineering",
    interests: ["Robotics", "3D Printing"],
    mutualConnections: 8,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: false
    },
    {
      id: 3,
    name: "Sophia Williams",
    role: "Grad Student",
    department: "Psychology",
    interests: ["Research", "Cognitive Science"],
    mutualConnections: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true
    },
    {
      id: 4,
    name: "Dr. James Taylor",
    role: "Department Head",
    department: "Physics",
    interests: ["Quantum Computing", "Astronomy"],
    mutualConnections: 3,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: true
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "Research Assistant",
    department: "Biology",
    interests: ["Genetics", "Biotech"],
    mutualConnections: 7,
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    verified: false
  }
]

export default function SuggestedConnections() {
  const [users, setUsers] = useState(initialUsers)
  const [connectState, setConnectState] = useState<Record<number, string>>({})

  const handleConnect = (userId: number) => {
    setConnectState(prev => ({
      ...prev,
      [userId]: prev[userId] === "Connecting" ? "Connected" : "Connecting"
    }))
  }

  return (
    <Card className="border-none shadow-md overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mt-16 -mr-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -mb-16 -ml-16 blur-xl"></div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold">People You May Know</CardTitle>
          </div>
          <Button variant="ghost" className="text-xs text-blue-600 h-8 px-2">View All</Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-4">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/80 transition-colors duration-300"
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
                </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="font-medium text-sm group-hover:text-blue-600 transition-colors truncate">
                    {user.name}
                  </div>
                  {user.verified && (
                    <span className="ml-1 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.49 4.49 0 01-3.498 1.306 4.491 4.491 0 01-3.497 1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 truncate">
                  {user.role} • {user.department}
                </div>
                
                <div className="flex mt-1 flex-wrap gap-1">
                  {user.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-[9px] py-0 h-4 border-gray-200 bg-gray-50"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-[10px] text-gray-500 mt-1">
                  {user.mutualConnections} mutual connections
                </div>
              </div>
              
              <Button 
                size="sm" 
                className={`h-8 rounded-full text-xs transition-all duration-300 ${
                  connectState[user.id] === "Connected" 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={() => handleConnect(user.id)}
              >
                {connectState[user.id] === "Connected" ? "Connected" : 
                 connectState[user.id] === "Connecting" ? "Connecting..." : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
