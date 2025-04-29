"use client"

import { motion } from "framer-motion"
import { ModuleCard } from "./module-card"

interface ModulesGridProps {
  modules: any[]
  onModuleClick: (moduleId: string) => void
}

export function ModulesGrid({ modules, onModuleClick }: ModulesGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} onClick={onModuleClick} />
        ))}
      </motion.div>
    </div>
  )
}
