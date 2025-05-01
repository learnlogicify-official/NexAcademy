"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Code } from "lucide-react"

interface Language {
  name: string
  proficiency: number
  color: string
  icon?: string
}

interface ProgrammingLanguagesCardProps {
  languages: Language[]
  className?: string
}

export function ProgrammingLanguagesCard({ languages, className }: ProgrammingLanguagesCardProps) {
  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <span className="truncate">Programming Languages</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-5">
          {languages.map((language, index) => (
            <motion.div
              key={language.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {language.icon && <span className="text-xl flex-shrink-0">{language.icon}</span>}
                  <span className="font-medium text-gray-200 break-words whitespace-normal block max-h-12 overflow-y-auto">{language.name}</span>
                </div>
                <span className="text-sm text-gray-400 flex-shrink-0">{language.proficiency}%</span>
              </div>
              <Progress value={language.proficiency} className="h-2" indicatorClassName={`${language.color}`} />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
