"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Cropper from "react-easy-crop"
import { Point, Area } from "react-easy-crop"
import { Upload, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProfilePic } from "@/components/ProfilePicContext"
import getCroppedImg from "@/utils/cropImage"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"

interface BannerImageStepProps {
  bannerImage: string
  updateBannerImage: (bannerImage: string) => void
  onClose: () => void
}

export default function BannerImageStep({
  bannerImage,
  updateBannerImage,
  onClose,
}: BannerImageStepProps) {
  const [image, setImage] = useState<string | null>(bannerImage || null)
  const [croppedImage, setCroppedImage] = useState<string | null>(bannerImage || null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { setBannerImage } = useProfilePic();

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropImage = async () => {
    if (image && croppedAreaPixels) {
      try {
        setLoading(true)
        const croppedImg = await getCroppedImg(image, croppedAreaPixels)
        const url = await uploadToCloudinary(croppedImg)
        setCroppedImage(url)
        updateBannerImage(url)
        await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerImage: url }),
        })
        setBannerImage(url)
        router.refresh()
        setShowCropper(false)
        setLoading(false)
        onClose()
      } catch (error) {
        setLoading(false)
        console.error("Error cropping/uploading image:", error)
      }
    }
  }

  const removeImage = async () => {
    setLoading(true)
    setImage(null)
    setCroppedImage(null)
    updateBannerImage("")
    setBannerImage("")
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerImage: "" }),
    })
    router.refresh()
    setShowCropper(false)
    setLoading(false)
    onClose()
  }

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Change Profile Banner</h2>
        <p className="text-muted-foreground">
          Upload a wide image for your profile banner (recommended 4:1 ratio).
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
          <span className="ml-2 text-primary">Saving...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {!showCropper ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {croppedImage ? (
                  <img src={croppedImage} alt="Banner" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-muted-foreground">No banner image</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById("banner-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {croppedImage ? "Change Banner" : "Upload Banner"}
                </Button>
                {croppedImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={removeImage}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                type="file"
                id="banner-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="relative h-40 w-full rounded-lg overflow-hidden">
                <Cropper
                  image={image || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom" className="text-sm">Zoom</Label>
                <input
                  id="zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCropper(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCropImage}
                >
                  Crop & Save
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Close
        </Button>
      </div>
    </div>
  )
} 