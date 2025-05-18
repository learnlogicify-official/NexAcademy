"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"
import CreatePost from "../components/create-post"
import TrendingTopics from "../components/trending-topics"
import UpcomingEvents from "../components/upcoming-events"
import SuggestedConnections from "../components/suggested-connections"
import { BookmarkIcon, Heart, MessageCircle, Send } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

// Define types for post and author
interface Author {
  name: string;
  role: string;
  avatar: string;
  department: string;
  verified: boolean;
}

interface Post {
  id: number;
  author: Author;
  content: {
    text: string;
    type: string;
  };
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  bookmarked: boolean;
  liked: boolean;
}

const posts = [
  {
    id: 1,
    author: {
      name: "Dr. Emma Johnson",
      role: "Professor, Computer Science",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      department: "Computer Science",
      verified: true,
    },
    content: {
      text: "Just published a new research paper on AI ethics in education! Check it out and let me know your thoughts.",
      type: "academic",
    },
    image: "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: "2 hours ago",
    likes: 42,
    comments: 8,
    tags: ["research", "ai", "ethics"],
    bookmarked: false,
    liked: false,
  },
  {
    id: 2,
    author: {
      name: "Student Council",
      role: "Official Organization",
      avatar: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      department: "Student Affairs",
      verified: true,
    },
    content: {
      text: "Reminder: Registration for the Spring Festival is now open! Join us for music, food, and fun on the main campus quad next weekend.",
      type: "announcement",
    },
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: "Yesterday",
    likes: 156,
    comments: 24,
    tags: ["event", "festival", "campus"],
    bookmarked: true,
    liked: false,
  },
  {
    id: 3,
    author: {
      name: "Michael Chen",
      role: "Student, Engineering",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      department: "Mechanical Engineering",
      verified: false,
    },
    content: {
      text: "Our team just won the National Robotics Competition! So proud of everyone who contributed to this amazing project.",
      type: "achievement",
    },
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: "2 days ago",
    likes: 215,
    comments: 47,
    tags: ["robotics", "competition", "engineering"],
    bookmarked: false,
    liked: false,
  },
  {
    id: 4,
    author: {
      name: "Campus Library",
      role: "Official Department",
      avatar: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      department: "Library Services",
      verified: true,
    },
    content: {
      text: "New extended hours for finals week! The main library will be open 24/7 from May 1-14. Study rooms can be reserved online.",
      type: "announcement",
    },
    image: "https://images.unsplash.com/photo-1561518776-e76a5e48f731?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: "3 days ago",
    likes: 89,
    comments: 12,
    tags: ["library", "finals", "study"],
    bookmarked: false,
    liked: false,
  },
  {
    id: 5,
    author: {
      name: "Sophia Rodriguez",
      role: "Graduate Student, Psychology",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      department: "Psychology",
      verified: false,
    },
    content: {
      text: "Looking for participants for my research study on stress management techniques among college students. Takes only 20 minutes and you'll receive a $15 gift card!",
      type: "research",
    },
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: "4 days ago",
    likes: 32,
    comments: 18,
    tags: ["research", "psychology", "participants"],
    bookmarked: false,
    liked: false,
  },
]

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "All" },
    { id: "academic", label: "Academic" },
    { id: "announcements", label: "Announcements" },
    { id: "events", label: "Events" },
    { id: "trending", label: "Trending" },
  ]

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true
    if (activeTab === "academic") return post.content.type === "academic" || post.content.type === "research"
    if (activeTab === "announcements") return post.content.type === "announcement"
    if (activeTab === "events") return post.tags?.includes("event")
    if (activeTab === "trending") return post.likes > 100
    return true
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CreatePost />

          {/* Instagram-style tabs */}
          <div className="flex justify-center border-b border-gray-200">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-3 relative text-xs font-semibold uppercase tracking-wider",
                    activeTab === tab.id ? "text-black" : "text-gray-500",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <InstagramStylePost key={post.id} post={post} />
            ))}
          </div>
        </div>

        <div className="hidden lg:block space-y-6">
          <TrendingTopics />
          <UpcomingEvents />
          <SuggestedConnections />
        </div>
      </div>
    </div>
  )
}

function InstagramStylePost({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [likeCount, setLikeCount] = useState(post.likes);
  
  const handleLike = () => {
    if (liked) {
      setLikeCount((prev: number) => prev - 1);
    } else {
      setLikeCount((prev: number) => prev + 1);
    }
    setLiked(!liked);
  };
  
  return (
    <Card className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Post header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-white ring-2 ring-gray-100">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-semibold text-sm">{post.author.name}</span>
              {post.author.verified && (
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
            <div className="text-xs text-gray-500">{post.author.role}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post image */}
      <div className="relative aspect-square w-full">
        <Image
          src={post.image}
          alt="Post image"
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {/* Post actions */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hover:bg-red-50"
              onClick={handleLike}
            >
              <Heart className={`w-6 h-6 transition-colors duration-300 ${liked ? "fill-red-500 text-red-500" : "hover:text-red-500"}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-blue-50">
              <MessageCircle className="w-6 h-6 hover:text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-blue-50">
              <Send className="w-6 h-6 hover:text-blue-500" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-yellow-50"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <BookmarkIcon className={`w-6 h-6 transition-colors duration-300 ${bookmarked ? "fill-yellow-500 text-yellow-500" : "hover:text-yellow-500"}`} />
          </Button>
        </div>

        {/* Likes */}
        <div className="font-semibold text-sm mb-1">{likeCount} likes</div>

        {/* Caption */}
        <div className="text-sm mb-2">
          <span className="font-semibold mr-1">{post.author.name}</span>
          {post.content.text}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-xs text-blue-600 hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>

        {/* Comments */}
        <button className="text-gray-500 text-xs hover:text-gray-700 mb-1">View all {post.comments} comments</button>

        {/* Time */}
        <div className="text-xs text-gray-500 mt-1">{post.timestamp}</div>

        {/* Add comment */}
        <div className="flex items-center mt-3 border-t pt-3">
          <input type="text" placeholder="Add a comment..." className="flex-1 border-none text-sm focus:outline-none" />
          <button className="text-blue-600 font-semibold text-sm hover:text-blue-800">Post</button>
        </div>
      </div>
    </Card>
  )
}
