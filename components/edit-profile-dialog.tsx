"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface User {
  id: number
  name: string
  username: string
  email: string
  avatar: string
  bio: string
  interests: string[]
}

interface EditProfileDialogProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: Partial<User>) => void
}

export function EditProfileDialog({ user, isOpen, onClose, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    interests: [...user.interests],
  })
  const [newInterest, setNewInterest] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="resize-none"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/160 characters</p>
          </div>

          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeInterest(interest)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {interest}</span>
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addInterest()
                  }
                }}
              />
              <Button onClick={addInterest} type="button" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

