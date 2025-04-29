"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AtSign, Mail, MessageSquare } from "lucide-react"

interface ContactLink {
  type: string
  username: string
  url: string
  icon: React.ReactNode
}

interface ContactLinksCardProps {
  links: ContactLink[]
  email: string
  className?: string
}

export function ContactLinksCard({ links, email, className }: ContactLinksCardProps) {
  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <AtSign className="h-5 w-5 text-purple-500" />
          Contact & Social
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-4">
          {/* Email Button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Button
              variant="outline"
              className="w-full bg-[#1a1a1a] border-gray-800 hover:bg-gray-800 text-gray-200"
              onClick={() => (window.location.href = `mailto:${email}`)}
            >
              <Mail className="mr-2 h-4 w-4 text-purple-500" />
              <span className="text-sm">{email}</span>
            </Button>
          </motion.div>

          {/* Message Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button variant="outline" className="w-full bg-[#1a1a1a] border-gray-800 hover:bg-gray-800 text-gray-200">
              <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
              <span className="text-sm">Send Message</span>
            </Button>
          </motion.div>

          {/* Social Links */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Social Profiles</h3>
            <div className="grid grid-cols-2 gap-3">
              {links.map((link, index) => (
                <motion.a
                  key={link.type}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 bg-[#1a1a1a] p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {link.icon}
                  <span className="text-sm text-gray-300">{link.username}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
