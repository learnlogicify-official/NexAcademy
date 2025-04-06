"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { User, Pencil, Save, X, Plus } from "lucide-react"

interface AboutMeUser {
  id: number
  bio: string
  interests: string[]
}

interface AboutMeProps {
  user: AboutMeUser
}

export function AboutMe({ user }: AboutMeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(user.bio)
  const [interests, setInterests] = useState(user.interests)
  const [newInterest, setNewInterest] = useState("")

  const handleSave = () => {
    // In a real app, you would save the changes to the backend here
    setIsEditing(false)
  }

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" /> About Me
        </CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => {
                setBio(user.bio)
                setInterests(user.interests)
                setIsEditing(false)
              }}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" className="gap-1" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Bio</h3>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeInterest(interest)}
                    >
                      ×
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
                <Button onClick={addInterest} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="mb-2 text-sm font-medium">Bio</h3>
              <p className="text-sm text-muted-foreground">{bio}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

