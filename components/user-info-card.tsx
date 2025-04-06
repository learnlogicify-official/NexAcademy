"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Flame, Mail, Pencil } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  avatar: string
  level: {
    number: number
    title: string
  }
  xp: {
    current: number
    nextLevel: number
  }
  streak: number
  joinedDate: string
}

interface UserInfoCardProps {
  user: User
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({ ...user })

  const handleSave = () => {
    // In a real app, you would save the changes to the backend here
    setIsEditing(false)
  }

  const xpProgress = (user.xp.current / user.xp.nextLevel) * 100

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>

          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge className="level-badge gap-1 px-3 py-1.5">
              Level {user.level.number}: {user.level.title}
            </Badge>
            <Badge variant="outline" className="gap-1 px-2 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {user.streak}-day streak
            </Badge>
          </div>

          <div className="mt-6 w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>XP Progress</span>
              <span>
                {user.xp.current} / {user.xp.nextLevel} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(user.xp.nextLevel - user.xp.current)} XP needed for Level {user.level.number + 1}
            </p>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Member since {new Date(user.joinedDate).toLocaleDateString()}
          </p>
        </div>
      </CardContent>

      <CardFooter className="bg-secondary/50 p-4">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={editedUser.avatar} alt={editedUser.name} />
                  <AvatarFallback>
                    {editedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

