"use client"

import { CheckCircle2, Lock } from "lucide-react"

interface ModuleNavigationProps {
  modules: any[]
  currentModuleId: string
  onModuleClick: (moduleId: string) => void
}

export function ModuleNavigation({ modules, currentModuleId, onModuleClick }: ModuleNavigationProps) {
  return (
    <div className="border-t border-gray-800 pt-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Module Navigation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
              module.id === currentModuleId
                ? "bg-blue-500/20 border border-blue-500/30"
                : "bg-gray-900 border border-gray-800 hover:border-gray-700"
            }`}
            onClick={() => onModuleClick(module.id)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                module.status === "Completed"
                  ? "bg-green-500/20"
                  : module.status === "In Progress"
                    ? "bg-blue-500/20"
                    : "bg-gray-800"
              }`}
            >
              {module.status === "Completed" ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : module.status === "Locked" ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : (
                <span className="text-sm">{module.order}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{module.title}</div>
              <div className="text-xs text-gray-400">{module.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
