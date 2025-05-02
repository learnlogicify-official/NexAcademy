"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Cropper from "react-easy-crop"
import { Point, Area } from "react-easy-crop"
import { Camera, Upload, Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import getCroppedImg from "@/utils/cropImage"
import { uploadToCloudinary } from "@/utils/uploadToCloudinary"
import { useRouter } from "next/navigation"
import { useProfilePic } from "@/components/ProfilePicContext"

interface ProfilePictureStepProps {
  profilePic: string
  updateProfilePic: (profilePic: string) => void
  onNext: () => void
  onBack: () => void
  username: string
}

export default function ProfilePictureStep({
  profilePic,
  updateProfilePic,
  onNext,
  onBack,
  username,
}: ProfilePictureStepProps) {
  const [image, setImage] = useState<string | null>(profilePic || null)
  const [croppedImage, setCroppedImage] = useState<string | null>(profilePic || null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { setProfilePic } = useProfilePic();

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
        updateProfilePic(url)
        await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePic: url }),
        })
        setProfilePic(url);
        router.refresh();
        setShowCropper(false)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error("Error cropping/uploading image:", error)
      }
    }
  }

  const removeImage = async () => {
    setLoading(true);
    setImage(null);
    setCroppedImage(null);
    updateProfilePic("");
    setProfilePic("");
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profilePic: "" }),
    });
    router.refresh();
    setShowCropper(false);
    setLoading(false);
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Choose a profile picture</h2>
        <p className="text-muted-foreground">
          This will help your friends recognize you in the community.
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
              <Avatar className="h-32 w-32 mb-4 border-2 border-primary/20">
                {croppedImage ? (
                  <AvatarImage src={croppedImage} alt={username} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {username ? username.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById("profile-pic-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {croppedImage ? "Change Picture" : "Upload Picture"}
                </Button>

                {croppedImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => removeImage()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              <input
                type="file"
                id="profile-pic-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                <Cropper
                  image={image || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={loading}>
          Continue
        </Button>
      </div>
    </div>
  )
} 