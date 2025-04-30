"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Code, FileText, Lightbulb, Target, Video, ClipboardCheck, Download, ExternalLink, BookOpen, CheckCircle2, ChevronRight, GraduationCap, Pencil } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

// Custom scrollbar hiding styles
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`

interface ChapterIntroSectionProps {
  module: {
    id: string
    title: string
    description: string
    level: string
    course?: {
      level: string
    }
    learningObjectives?: string[]
  }
  videoCount?: number
  videoCompleted?: number
  lessonCount?: number
  lessonCompleted?: number
  practiceCount?: number
  practiceCompleted?: number
  assessmentCount?: number
  assessmentCompleted?: number
}

export function ChapterIntroSection({ module, videoCount = 0, videoCompleted = 0, lessonCount = 0, lessonCompleted = 0, practiceCount = 0, practiceCompleted = 0, assessmentCount = 0, assessmentCompleted = 0 }: ChapterIntroSectionProps) {
  const [editing, setEditing] = useState(false);
  const [objectives, setObjectives] = useState<string[]>(module.learningObjectives ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleObjectiveChange = (idx: number, value: string) => {
    setObjectives(prev => prev.map((obj, i) => (i === idx ? value : obj)));
  };
  const handleAddObjective = () => setObjectives(prev => [...prev, ""]);
  const handleRemoveObjective = (idx: number) => setObjectives(prev => prev.filter((_, i) => i !== idx));
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningObjectives: objectives }),
      });
      if (!res.ok) throw new Error("Failed to save objectives");
      setEditing(false);
    } catch (e) {
      setError("Could not save objectives");
    } finally {
      setSaving(false);
    }
  };

  // Get module-specific learning objectives (limited to 3 for space)
  const getLearningObjectives = (moduleId: string) => {
    const allObjectives = {
      "variables-data-types": [
        "Understand what variables are and how they work in Python",
        "Learn about different data types: integers, floats, strings, and booleans",
        "Practice type conversion between different data types",
      ],
      "control-flow": [
        "Learn how to use if, elif, and else statements",
        "Understand comparison and logical operators",
        "Master nested conditional statements",
      ],
      functions: [
        "Understand how to define and call functions",
        "Learn about function parameters and return values",
        "Master default parameters and keyword arguments",
      ],
      loops: [
        "Learn how to use for loops with range and collections",
        "Understand while loops and when to use them",
        "Master loop control statements: break, continue, and pass",
      ],
      "lists-tuples": [
        "Understand the differences between lists and tuples",
        "Learn common operations for lists: append, insert, remove",
        "Master slicing and indexing techniques",
      ],
      default: [
        "Understand key concepts in this module",
        "Practice applying these concepts in real-world scenarios",
        "Master the techniques through hands-on exercises",
      ],
    }

    return allObjectives[moduleId as keyof typeof allObjectives] || allObjectives.default
  }

  // Get module-specific chapter content
  const getChapterContent = (moduleId: string) => {
    switch (moduleId) {
      case "variables-data-types":
        return {
          duration: "45 min",
          videoCount: 2,
          readingCount: 3,
          exerciseCount: 10,
          quizCount: 1,
        }
      case "control-flow":
        return {
          duration: "50 min",
          videoCount: 2,
          readingCount: 2,
          exerciseCount: 12,
          quizCount: 1,
        }
      case "functions":
        return {
          duration: "55 min",
          videoCount: 3,
          readingCount: 2,
          exerciseCount: 15,
          quizCount: 1,
        }
      case "loops":
        return {
          duration: "60 min",
          videoCount: 2,
          readingCount: 3,
          exerciseCount: 12,
          quizCount: 1,
        }
      case "lists-tuples":
        return {
          duration: "65 min",
          videoCount: 3,
          readingCount: 2,
          exerciseCount: 15,
          quizCount: 1,
        }
      default:
        return {
          duration: "60 min",
          videoCount: 2,
          readingCount: 2,
          exerciseCount: 10,
          quizCount: 1,
        }
    }
  }

  // Get module-specific skills (to be displayed as tags)
  const getModuleSkills = (moduleId: string) => {
    const allSkills = {
      "variables-data-types": ["Variables", "Data Types", "Type Conversion", "Python Basics"],
      "control-flow": ["Conditionals", "Boolean Logic", "Decision Making", "If-Else"],
      "functions": ["Functions", "Parameters", "Return Values", "Code Reuse"],
      "loops": ["For Loops", "While Loops", "Iteration", "Break/Continue"],
      "lists-tuples": ["Lists", "Tuples", "Collections", "Indexing"],
      default: ["Programming", "Problem Solving", "Algorithm Design"]
    };
    return allSkills[moduleId as keyof typeof allSkills] || allSkills.default;
  };

  const skills = getModuleSkills(module.id);

  // Progress animation delay sequence
  const baseDelay = 0.1;

  // Related resources (would come from API in a real app)
  const resources = [
    { title: "Essential Notes", type: "PDF", url: "#", icon: <FileText className="h-4 w-4"/> },
    { title: "Practice Code", type: "GitHub", url: "#", icon: <Code className="h-4 w-4"/> },
    { title: "Video Tutorial", type: "Video", url: "#", icon: <Video className="h-4 w-4"/> }
  ];

  const totalProgress = (videoCompleted + lessonCompleted + practiceCompleted + assessmentCompleted) / 
                         (videoCount + lessonCount + practiceCount + assessmentCount) * 100 || 0;

  const learningObjectives = getLearningObjectives(module.id)
  const chapterContent = getChapterContent(module.id)

  return (
    <>
      <style jsx global>
        {scrollbarHideStyles}
      </style>
      <div className="h-[calc(100vh-12rem)] flex flex-col pt-2">
        <Card className="overflow-hidden border-0 shadow-md bg-[#121212] flex-1 flex flex-col">
          <CardContent className="p-6 pb-10 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className="mb-0 bg-gradient-to-r from-blue-500/80 to-violet-500/80 text-white border-none px-3 py-1 text-xs">
                    {module.course?.level || module.level}
                  </Badge>
                  <Badge variant="outline" className="bg-black/30 border-white/10 text-gray-300 text-xs">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    {chapterContent.duration}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 bg-black/30 border border-white/5 px-3 py-1.5 rounded-full">
                  <div className="text-xs font-medium text-gray-300">Module Progress</div>
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-300">{Math.round(totalProgress)}%</span>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-5 rounded-xl border border-blue-500/10">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-300">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                  About This Module
                </h3>
                <p className="text-gray-300 mb-4">
                  {module.description || "This module covers essential concepts that will help you build a strong foundation. Follow the learning path and complete all sections to master this topic."}
                </p>
                <div className="pl-4 border-l-2 border-blue-500/30 italic text-gray-400 text-sm">
                  "The best way to learn programming is by doing. Take your time with the exercises, and don't be afraid to experiment with the code."
                </div>
              </div>

              {/* Two-column section for Progress and Objectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Progress Column */}
                <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Completion Progress
                  </h3>
                  <div className="space-y-5">
                    <ProgressBar 
                      label="Videos" 
                      icon={<Video className='h-4 w-4 text-indigo-400' />} 
                      completed={videoCompleted} 
                      total={videoCount} 
                      color="from-indigo-600 to-indigo-400" 
                      delay={baseDelay}
                    />
                    <ProgressBar 
                      label="Lessons" 
                      icon={<BookOpen className='h-4 w-4 text-blue-400' />} 
                      completed={lessonCompleted} 
                      total={lessonCount} 
                      color="from-blue-600 to-blue-400" 
                      delay={baseDelay * 2}
                    />
                    <ProgressBar 
                      label="Practice" 
                      icon={<Code className='h-4 w-4 text-cyan-400' />} 
                      completed={practiceCompleted} 
                      total={practiceCount} 
                      color="from-cyan-600 to-cyan-400" 
                      delay={baseDelay * 3}
                    />
                    <ProgressBar 
                      label="Assessments" 
                      icon={<ClipboardCheck className='h-4 w-4 text-purple-400' />} 
                      completed={assessmentCompleted} 
                      total={assessmentCount} 
                      color="from-purple-600 to-purple-400" 
                      delay={baseDelay * 4}
                    />
                        </div>
                </div>

                {/* Objectives Column */}
                <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                    <Target className="h-5 w-5" />
                    Learning Objectives
                    {!editing && (
                      <Button size="sm" variant="ghost" className="ml-2 h-7 px-2 hover:bg-white/10" onClick={() => setEditing(true)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </h3>
                  {editing ? (
                    <div className="space-y-2">
                      {objectives.map((objective, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <Input
                            value={objective}
                            onChange={e => handleObjectiveChange(idx, e.target.value)}
                            className="bg-black/30 border-white/10"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveObjective(idx)}>
                            ×
                          </Button>
                      </div>
                      ))}
                      <Button size="sm" onClick={handleAddObjective} className="mt-2">Add Objective</Button>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleSave} disabled={saving}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                      </div>
                      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                    </div>
                  ) : (
                    <motion.ul 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-2.5 mt-1 text-gray-300"
                    >
                      {(objectives.length > 0 ? objectives : getLearningObjectives(module.id)).map((objective, idx) => (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx, duration: 0.4 }}
                          className="flex items-start gap-2"
                        >
                          <div className="mt-0.5 text-blue-500">
                            <ChevronRight className="h-4 w-4" />
                      </div>
                          <span>{objective}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                      </div>
                    </div>

              {/* Skills Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-8 bg-black/30 p-5 rounded-xl border border-white/5"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amber-400">
                  <GraduationCap className="h-5 w-5" />
                  Skills You'll Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge 
                      key={index}
                      className="bg-gradient-to-r from-amber-800/30 to-amber-600/30 border-amber-500/30 text-amber-300 px-3 py-1.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* Resources Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-8 bg-black/30 p-5 rounded-xl border border-white/5"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-400">
                  <Download className="h-5 w-5" />
                  Related Resources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {resources.map((resource, index) => (
                    <a 
                      href={resource.url} 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5 text-gray-300 hover:bg-purple-900/20 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="bg-purple-900/30 p-2 rounded-md">
                        {resource.icon}
                      </div>
                      <div>
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          {resource.type}
                          <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* How to use section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-gradient-to-r from-indigo-900/20 to-violet-900/20 p-5 rounded-xl border border-indigo-500/10 mt-auto"
              >
                <h3 className="text-lg font-medium mb-2 text-indigo-300">How to use this module:</h3>
                <ol className="space-y-1 text-gray-300 ml-5 list-decimal">
                  <li>Start with the <span className="text-indigo-300 font-medium">Videos</span> tab to get introduced to the concepts</li>
                  <li>Read through the <span className="text-blue-300 font-medium">Lessons</span> tab to deepen your understanding</li>
                  <li>Complete the exercises in the <span className="text-cyan-300 font-medium">Practice</span> tab</li>
                  <li>Test your knowledge in the <span className="text-purple-300 font-medium">Assessment</span> tab</li>
                </ol>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function ProgressBar({ label, icon, completed, total, color, delay = 0 }: { 
  label: string, 
  icon: React.ReactNode, 
  completed: number, 
  total: number, 
  color: string,
  delay?: number
}) {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="bg-black/40 rounded-md p-1.5 border border-white/5">
            {icon}
          </div>
          {label}
        </div>
        <span className="text-xs text-gray-400 font-medium bg-black/30 px-2 py-0.5 rounded-full">
          {completed} / {total}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full bg-gradient-to-r ${color}`} 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay }}
        />
      </div>
    </div>
  )
}
