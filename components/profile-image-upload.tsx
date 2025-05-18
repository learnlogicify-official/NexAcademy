"use client"
import { useState, useCallback } from "react"
import type React from "react"
import { Upload, Camera, Check, ArrowUpRight, X } from "lucide-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/image-cropper"

interface ProfileImageUploadProps {
  username: string
  onContinue?: (imageUrl: string | null) => void
}

export default function ProfileImageUpload({ username, onContinue }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setImage(imageDataUrl)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setImage(imageDataUrl)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
        setCroppedImage(croppedImage)
        setCropperOpen(false)
      }
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation, image])

  const handleCancelCrop = () => {
    if (!croppedImage) {
      setImage(null)
    }
    setCropperOpen(false)
  }

  const handleContinue = () => {
    console.log("Continue with profile image:", croppedImage || image)
    if (onContinue) {
      onContinue(croppedImage || image)
    }
  }

  const handleEditImage = () => {
    setCropperOpen(true)
  }

  // Determine if an image has been uploaded and processed
  const hasImage = croppedImage || image

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Conditional heading based on whether an image has been uploaded */}
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        {hasImage ? (
          <>
            <span className="text-green-400">Perfect!</span> Your profile image looks great,{" "}
            <span className="text-blue-400">{username}</span>
          </>
        ) : (
          <>
            Hello <span className="text-blue-400">{username}</span>, upload your profile image
          </>
        )}
      </h2>

      {/* Image Cropper Dialog */}
      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="sm:max-w-md bg-black/95 border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Crop your profile image</DialogTitle>
          </DialogHeader>

          {image && (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-80 mb-4">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div className="w-full mb-4">
                <label className="text-white/70 text-sm mb-1 block">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="w-full mb-4">
                <label className="text-white/70 text-sm mb-1 block">Rotation</label>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-4 w-full justify-end">
                <button
                  onClick={handleCancelCrop}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={showCroppedImage}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main content */}
      {hasImage ? (
        <div className="flex flex-col items-center">
          <div className="relative w-44 h-44 mb-4">
            {/* Purple border container */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 p-[4px] shadow-lg shadow-blue-500/20">
              {/* Image container */}
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={croppedImage || image || "/placeholder.svg"}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Success indicator */}
            <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1 z-10 border-2 border-black">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
          <button onClick={handleEditImage} className="text-blue-400 hover:text-blue-300 text-sm mb-4">
            Edit image
          </button>
        </div>
      ) : (
        <div
          className={`w-full max-w-md h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors ${
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4 bg-blue-500/20 p-4 rounded-full">
            {isDragging ? (
              <Upload className="w-10 h-10 text-blue-400" />
            ) : (
              <Camera className="w-10 h-10 text-blue-400" />
            )}
          </div>
          <p className="text-white/70 text-center mb-2">
            {isDragging ? "Drop your image here" : "Drag & drop your profile image here"}
          </p>
          <p className="text-white/50 text-sm text-center mb-4">or</p>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
            Browse files
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      )}

      {/* Continue button */}
      <div className="mt-4">
        <HoverBorderGradient
          containerClassName={`rounded-full ${!hasImage ? "opacity-50 cursor-not-allowed" : ""}`}
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${!hasImage ? "pointer-events-none" : ""}`}
          disabled={!hasImage}
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </HoverBorderGradient>
      </div>
    </div>
  )
}