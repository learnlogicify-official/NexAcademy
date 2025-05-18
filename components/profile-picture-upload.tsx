"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UploadCloud, User, Check, RefreshCw } from "lucide-react"

interface ProfilePictureUploadProps {
  username: string
  onContinue: (imageUrl: string | null) => void
}

export default function ProfilePictureUpload({ username, onContinue }: ProfilePictureUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset any previous errors
    setUploadError(null)

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size too large. Please select an image under 5MB.")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.")
      return
    }

    // Preview the selected image
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSkip = () => {
    onContinue(null)
  }

  const handleSubmit = async () => {
    // If no image selected, just continue
    if (!selectedImage) {
      handleSkip()
      return
    }

    // Simulate upload process
    setIsUploading(true)
    
    // For now, we'll just simulate uploading and pass the data URL
    // In a real app, you would upload the image to your server or cloud storage
    setTimeout(() => {
      setIsUploading(false)
      onContinue(selectedImage)
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bricolage font-medium text-white">
            Add a profile picture
          </h2>
          <p className="text-slate-400">
            Let others recognize you with a profile picture.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Avatar Preview */}
          <div className="relative group">
            <Avatar className="w-32 h-32 border-2 border-blue-500/30 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}>
              {selectedImage ? (
                <AvatarImage src={selectedImage} alt={username} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-white">
                  <User size={40} className="text-blue-200" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <UploadCloud className="w-8 h-8 text-white" />
            </div>
            
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose-500 text-sm"
            >
              {uploadError}
            </motion.p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 w-full">
            <Button
              onClick={handleSubmit}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium py-2 px-4 rounded-md w-full flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : selectedImage ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Continue
                </>
              ) : (
                "Continue"
              )}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              disabled={isUploading}
              className="text-slate-400 hover:text-white hover:bg-transparent"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 