"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"

interface Skill {
  name: string
  level: number // 1-5
  category: string
}

interface SkillsCardProps {
  skills: Skill[]
  className?: string
}

export function SkillsCard({ skills, className }: SkillsCardProps) {
  // Group skills by category
  const categories = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <Card className={`bg-[#121212] border-0 shadow-md h-[360px] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-emerald-500" />
          Technical Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[290px] custom-scrollbar">
        <div className="space-y-6">
          {Object.entries(categories).map(([category, categorySkills], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-gray-400">{category}</h3>
              <div className="grid grid-cols-2 gap-3">
                {categorySkills.map((skill, skillIndex) => (
                  <div key={skill.name} className="bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-full rounded-full ${i < skill.level ? "bg-emerald-500" : "bg-gray-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
