"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ImageIcon,
  MapPin,
  SmilePlus,
  Video,
  FileText,
  LinkIcon,
  ChevronDown,
  Users,
  Lock,
  Globe,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CreatePost() {
  const [postContent, setPostContent] = useState("")
  const [privacy, setPrivacy] = useState("public")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real app, you would upload these files to a server
      // Here we'll just create local URLs for preview
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setSelectedImages([...selectedImages, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  const privacyOptions = {
    public: { icon: Globe, label: "Public" },
    friends: { icon: Users, label: "Friends" },
    private: { icon: Lock, label: "Only Me" },
  }

  const SelectedPrivacyIcon = privacyOptions[privacy as keyof typeof privacyOptions].icon

  return (
    <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
      <CardContent className="p-5">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarImage src="/premium-user-avatar.png" alt="Your profile" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">John Doe</span>
              <span className="text-xs text-gray-500">@johndoe</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 rounded-full text-xs">
                    <SelectedPrivacyIcon className="h-3.5 w-3.5 mr-1" />
                    {privacyOptions[privacy as keyof typeof privacyOptions].label}
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setPrivacy("public")}>
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Public</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPrivacy("friends")}>
                    <Users className="h-4 w-4 mr-2" />
                    <span>Friends</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPrivacy("private")}>
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Only Me</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <textarea
              placeholder={`What's on your mind, John?`}
              className="w-full border-none focus:outline-none text-sm resize-none min-h-[80px] mb-3"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={3}
            />

            {/* Image previews */}
            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 mb-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden h-32">
                    <img src={img || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">Add to your post</div>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                      onClick={handleFileSelect}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Photo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100"
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Video</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                    >
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100"
                    >
                      <SmilePlus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Feeling/Activity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      <LinkIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Link</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button
              disabled={!postContent.trim() && selectedImages.length === 0}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-6 py-2"
            >
              Share
            </Button>
          </div>
        </div>
      </CardContent>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
    </Card>
  )
}
