"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Users,
  Video,
  MoreHorizontal,
  CalendarClock,
  Trash2,
  Copy,
  BadgeCheck,
  UserPlus,
  ChevronRight,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

// Define types
interface User {
  id: string
  name: string
  avatar: string
  online?: boolean
  role?: string
}

interface StudySession {
  id: string
  title: string
  date: Date
  duration: number
  attendees: User[]
  problemId?: string
  status: "upcoming" | "completed" | "in-progress"
}

interface Message {
  id: string
  user: User
  text: string
  timestamp: Date
  attachments?: string[]
  reactions?: {
    emoji: string
    count: number
    users: string[]
  }[]
}

interface StudyGroupProps {
  problemId: string
  problemTitle: string
  currentUser: User
}

export function StudyGroup({ problemId, problemTitle, currentUser }: StudyGroupProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [newSessionTitle, setNewSessionTitle] = useState("")
  const [newSessionDate, setNewSessionDate] = useState("")
  const [newSessionTime, setNewSessionTime] = useState("")
  const [newSessionDuration, setNewSessionDuration] = useState("60")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false)
  const [groupMembers, setGroupMembers] = useState<User[]>([
    currentUser,
    {
      id: "user2",
      name: "Alex Rivera",
      avatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff",
      online: true,
      role: "member"
    },
    {
      id: "user3",
      name: "Jamie Chen",
      avatar: "https://ui-avatars.com/api/?name=Jamie+Chen&background=4f46e5&color=fff",
      online: false,
      role: "member"
    },
    {
      id: "user4",
      name: "Morgan Taylor",
      avatar: "https://ui-avatars.com/api/?name=Morgan+Taylor&background=7c3aed&color=fff",
      role: "member"
    }
  ])

  // Initial mock data
  useEffect(() => {
    // Mock messages
    setMessages([
      {
        id: "msg1",
        user: {
          id: "user2",
          name: "Alex Rivera",
          avatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff"
        },
        text: "Has anyone figured out the O(n) solution for this problem? I keep getting stuck at the nested loops.",
        timestamp: new Date(Date.now() - 3600000 * 2) // 2 hours ago
      },
      {
        id: "msg2",
        user: {
          id: "user3",
          name: "Jamie Chen",
          avatar: "https://ui-avatars.com/api/?name=Jamie+Chen&background=4f46e5&color=fff"
        },
        text: "I think we need to use a hashmap to store the values we've seen so far. That way, we can check in constant time if the complement exists.",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: "msg3",
        user: currentUser,
        text: "Great point! I was trying to use two pointers but that only works if the array is sorted.",
        timestamp: new Date(Date.now() - 1800000) // 30 min ago
      }
    ])

    // Mock sessions
    setSessions([
      {
        id: "session1",
        title: "Group Study: Two Sum",
        date: new Date(Date.now() + 86400000), // Tomorrow
        duration: 60,
        attendees: [currentUser, groupMembers[1], groupMembers[2]],
        problemId: problemId,
        status: "upcoming"
      },
      {
        id: "session2",
        title: "Algorithm Review",
        date: new Date(Date.now() - 86400000 * 2), // 2 days ago
        duration: 45,
        attendees: [currentUser, groupMembers[1]],
        problemId: problemId,
        status: "completed"
      }
    ])
  }, [currentUser, problemId])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg${messages.length + 1}`,
      user: currentUser,
      text: newMessage.trim(),
      timestamp: new Date()
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate a response after a short delay
    if (messages.length % 3 === 0) {
      setTimeout(() => {
        const autoResponse: Message = {
          id: `msg${messages.length + 2}`,
          user: groupMembers[1],
          text: "That's a really good approach! Have you considered edge cases like empty arrays?",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, autoResponse])
      }, 8000)
    }
  }

  const handleCreateSession = () => {
    if (!newSessionTitle || !newSessionDate || !newSessionTime) {
      toast({
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const sessionDateTime = new Date(`${newSessionDate}T${newSessionTime}`)
    
    const newSession: StudySession = {
      id: `session${sessions.length + 1}`,
      title: newSessionTitle,
      date: sessionDateTime,
      duration: parseInt(newSessionDuration),
      attendees: [currentUser],
      problemId: problemId,
      status: "upcoming"
    }

    setSessions([...sessions, newSession])
    setIsCreateSessionOpen(false)
    
    // Reset form
    setNewSessionTitle("")
    setNewSessionDate("")
    setNewSessionTime("")
    setNewSessionDuration("60")
    
    toast({
      title: "Study session created",
      description: `Your session "${newSessionTitle}" has been scheduled.`,
      variant: "default"
    })
  }

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        description: "Please enter a valid email address.",
        variant: "destructive"
      })
      return
    }

    // Simulate invitation send
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}`,
      variant: "default"
    })
    
    setInviteEmail("")
    setIsInviteDialogOpen(false)
  }

  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) { // less than a minute
      return 'Just now'
    } else if (diff < 3600000) { // less than an hour
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) { // less than a day
      return `${Math.floor(diff / 3600000)}h ago`
    } else if (diff < 604800000) { // less than a week
      return `${Math.floor(diff / 86400000)}d ago`
    } else {
      return format(date, 'MMM d')
    }
  }

  return (
    <Card className="w-full border-none shadow-md overflow-hidden h-full flex flex-col">
      <CardHeader className="px-4 py-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/40 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Study Group
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
              Collaborate on "{problemTitle}"
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Group Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateSessionOpen(true)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Schedule Session
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="h-4 w-4 mr-2" />
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-4 py-1 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 rounded-none h-auto">
          <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Users className="h-3.5 w-3.5 mr-1" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden data-[state=active]:flex data-[state=inactive]:hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.user.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.user.id === currentUser.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${message.user.id === currentUser.id ? 'ml-2' : 'mr-2'}`}>
                      <AvatarImage src={message.user.avatar} />
                      <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg px-3 py-2 text-sm break-words ${
                          message.user.id === currentUser.id 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {message.text}
                      </div>
                      <div 
                        className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${
                          message.user.id === currentUser.id ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className="mr-1">{message.user.name.split(' ')[0]}</span>
                        <span>• {formatMessageTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <Textarea 
                placeholder="Type your message..."
                className="min-h-[40px] max-h-[120px] resize-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              />
              <Button 
                size="icon" 
                className="h-10 w-10 rounded-full bg-indigo-500 hover:bg-indigo-600"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:block data-[state=inactive]:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Upcoming Sessions</h3>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsCreateSessionOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Session
              </Button>
            </div>
            
            <div className="space-y-3 mb-6">
              {sessions.filter(s => s.status === "upcoming").map((session) => (
                <Card key={session.id} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{session.title}</h4>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(session.date, "MMM d, yyyy • h:mm a")}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          {session.duration} min
                        </div>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-[10px]">
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex -space-x-2">
                        {session.attendees.slice(0, 3).map((user) => (
                          <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-slate-900">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {session.attendees.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-medium border-2 border-white dark:border-slate-900">
                            +{session.attendees.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Video className="h-3.5 w-3.5 text-indigo-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {sessions.filter(s => s.status === "upcoming").length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming sessions</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-xs text-indigo-600 dark:text-indigo-400"
                    onClick={() => setIsCreateSessionOpen(true)}
                  >
                    Schedule one now
                  </Button>
                </div>
              )}
            </div>
            
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Past Sessions</h3>
            <div className="space-y-3">
              {sessions.filter(s => s.status === "completed").map((session) => (
                <Card key={session.id} className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">{session.title}</h4>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(session.date, "MMM d, yyyy • h:mm a")}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          {session.duration} min
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-[10px]">
                        {session.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {sessions.filter(s => s.status === "completed").length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No past sessions</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="flex-1 overflow-auto p-0 m-0 data-[state=active]:block data-[state=inactive]:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Group Members</h3>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Invite
              </Button>
            </div>
            
            <div className="space-y-3">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {member.online && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-1 ring-white dark:ring-slate-900"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.name}</span>
                        {member.id === currentUser.id && (
                          <Badge className="ml-2 px-1 py-0 text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                            You
                          </Badge>
                        )}
                        {member.role === "admin" && (
                          <Badge className="ml-2 px-1 py-0 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {member.online ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Invite friends to collaborate on this problem with you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Share link
              </label>
              <div className="flex">
                <Input
                  readOnly
                  value={`https://nexacademy.io/group/${problemId}`}
                  className="rounded-r-none"
                />
                <Button
                  className="rounded-l-none"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://nexacademy.io/group/${problemId}`)
                    toast({
                      description: "Link copied to clipboard",
                    })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Session Dialog */}
      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Study Session</DialogTitle>
            <DialogDescription>
              Create a new study session for your group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="session-title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Session Title
              </label>
              <Input
                id="session-title"
                placeholder="e.g., Group Study: Two Sum"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="session-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <Input
                  id="session-date"
                  type="date"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="session-time" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Time
                </label>
                <Input
                  id="session-time"
                  type="time"
                  value={newSessionTime}
                  onChange={(e) => setNewSessionTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="session-duration" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration (minutes)
              </label>
              <Input
                id="session-duration"
                type="number"
                value={newSessionDuration}
                onChange={(e) => setNewSessionDuration(e.target.value)}
                min="15"
                max="240"
                step="15"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsCreateSessionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>
              <CalendarClock className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 