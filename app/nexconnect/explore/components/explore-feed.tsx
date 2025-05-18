"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Search, Filter, Users, UserPlus, Globe, School, Badge, Building2, MapPin, GraduationCap, Calendar } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import TrendingTopics from "../../components/trending-topics"
import UpcomingEvents from "../../components/upcoming-events"
import SuggestedConnections from "../../components/suggested-connections"
import { Badge as UIBadge } from "@/components/ui/badge"

// Define types for user profiles
interface UserProfile {
  id: number;
  name: string;
  username: string;
  role: string;
  department: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  interests: string[];
  mutual: number;
  isFollowing: boolean;
  verified: boolean;
}

// Sample user data
const suggestedUsers: UserProfile[] = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexj",
    role: "Computer Science Student",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "AI enthusiast, competitive programmer, and coffee addict",
    interests: ["AI", "Machine Learning", "Algorithms"],
    mutual: 3,
    isFollowing: false,
    verified: false,
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    username: "drschen",
    role: "Associate Professor",
    department: "Computer Science",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "Researching human-computer interaction and AR/VR technologies",
    interests: ["HCI", "Virtual Reality", "UX Design"],
    mutual: 0,
    isFollowing: false,
    verified: true,
  },
  {
    id: 3,
    name: "Marcus Williams",
    username: "marcwilliams",
    role: "Business Administration Student",
    department: "Business School",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "Aspiring entrepreneur, marketing enthusiast, and campus event organizer",
    interests: ["Entrepreneurship", "Marketing", "Event Planning"],
    mutual: 5,
    isFollowing: true,
    verified: false,
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    username: "emilyr",
    role: "Psychology Student",
    department: "Social Sciences",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "Passionate about cognitive psychology and mental health advocacy",
    interests: ["Psychology", "Mental Health", "Neuroscience"],
    mutual: 2,
    isFollowing: false,
    verified: false,
  },
  {
    id: 5,
    name: "Campus Innovation Hub",
    username: "innovationhub",
    role: "Official Organization",
    department: "Student Affairs",
    avatar: "https://images.unsplash.com/photo-1565351937067-57e63a2b5a5c?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "The central hub for campus innovation, entrepreneurship, and creativity",
    interests: ["Innovation", "Startups", "Technology"],
    mutual: 12,
    isFollowing: false,
    verified: true,
  },
  {
    id: 6,
    name: "Prof. Michael Taylor",
    username: "prof_taylor",
    role: "Department Chair",
    department: "Physics",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    coverPhoto: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    bio: "Theoretical physicist specializing in quantum mechanics and cosmology",
    interests: ["Physics", "Quantum Mechanics", "Astronomy"],
    mutual: 1,
    isFollowing: false,
    verified: true,
  }
];

// Popular departments for filtering
const departments = [
  { id: "all", name: "All Departments" },
  { id: "eng", name: "Engineering", icon: <Building2 className="h-3 w-3" /> },
  { id: "cs", name: "Computer Science", icon: <School className="h-3 w-3" /> },
  { id: "business", name: "Business School", icon: <Badge className="h-3 w-3" /> },
  { id: "social", name: "Social Sciences", icon: <Users className="h-3 w-3" /> },
  { id: "arts", name: "Arts & Humanities", icon: <GraduationCap className="h-3 w-3" /> }
];

export default function ExploreFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState(suggestedUsers);

  // Filter users based on search and department
  const filterUsers = (term: string, dept: string) => {
    let result = [...suggestedUsers];
    
    // Apply search filter
    if (term) {
      const lowerTerm = term.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerTerm) || 
        user.role.toLowerCase().includes(lowerTerm) || 
        user.bio.toLowerCase().includes(lowerTerm) ||
        user.interests.some(interest => interest.toLowerCase().includes(lowerTerm))
      );
    }
    
    // Apply department filter
    if (dept !== "all") {
      result = result.filter(user => 
        user.department.toLowerCase().includes(dept.toLowerCase())
      );
    }
    
    setFilteredUsers(result);
  };

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterUsers(term, activeDepartment);
  };

  // Handle department filter changes
  const handleDepartmentChange = (dept: string) => {
    setActiveDepartment(dept);
    filterUsers(searchTerm, dept);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Find People Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Find People
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Discover and connect with students, professors, and organizations
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="p-4 border-none shadow-md rounded-xl">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search for people, departments, or interests..." 
                  className="pl-10 border-none bg-gray-100 text-gray-900 focus-visible:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Department Filters */}
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
            {departments.map(dept => (
              <Button 
                key={dept.id}
                variant={activeDepartment === dept.id ? "default" : "outline"}
                className={cn(
                  "rounded-full whitespace-nowrap",
                  activeDepartment === dept.id ? "bg-blue-600" : "bg-white"
                )}
                onClick={() => handleDepartmentChange(dept.id)}
              >
                {dept.icon && <span className="mr-1">{dept.icon}</span>}
                {dept.name}
              </Button>
            ))}
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* No results message */}
          {filteredUsers.length === 0 && (
            <div className="py-10 text-center">
              <div className="bg-gray-100 inline-flex rounded-full p-5 mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No matching people found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        <div className="hidden lg:block space-y-6">
          <Card className="p-6 border-none shadow-md rounded-xl">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" />
              People You May Know
            </h3>
            <div className="space-y-4">
              {suggestedUsers.slice(0, 3).map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white ring-1 ring-gray-100">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{user.name}</span>
                        {user.verified && (
                          <span className="ml-1 text-blue-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.49 4.49 0 01-3.498 1.306 4.491 4.491 0 01-3.497 1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Connect
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 text-sm">
                View More Suggestions
              </Button>
            </div>
          </Card>
          
          <TrendingTopics />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  )
}

function UserCard({ user }: { user: UserProfile }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
      {/* Cover photo */}
      <div className="relative h-24">
        <Image 
          src={user.coverPhoto} 
          alt={`${user.name}'s cover`} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* User info */}
      <div className="p-4 pt-0 relative">
        <Avatar className="w-16 h-16 border-4 border-white absolute -top-8 left-4 shadow-md">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex justify-end mt-1 mb-6">
          <Button 
            variant={isFollowing ? "outline" : "default"}
            size="sm" 
            className={cn(
              "rounded-full px-4",
              isFollowing ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "bg-blue-600"
            )}
            onClick={() => setIsFollowing(!isFollowing)}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
        
        <div className="flex items-center mb-1">
          <Link href={`/profile/${user.username}`} className="font-semibold hover:underline">
            {user.name}
          </Link>
          {user.verified && (
            <span className="ml-1 text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.49 4.49 0 01-3.498 1.306 4.491 4.491 0 01-3.497 1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">@{user.username}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
          <span className="text-sm text-gray-500">{user.role}</span>
        </div>
        
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{user.bio}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {user.interests.map((interest, index) => (
            <UIBadge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              {interest}
            </UIBadge>
          ))}
        </div>
        
        {user.mutual > 0 && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="h-3 w-3" />
            {user.mutual} mutual connection{user.mutual !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  );
}
