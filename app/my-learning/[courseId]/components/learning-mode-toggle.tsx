"use client"

import { Switch } from "@/components/ui/switch"

interface LearningModeToggleProps {
  mode: "guided" | "explore"
  onChange: (mode: "guided" | "explore") => void
}

export function LearningModeToggle({ mode, onChange }: LearningModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
      <span className="text-xs font-medium text-muted-foreground">{mode === "guided" ? "Guided" : "Explore"}</span>
      <Switch
        checked={mode === "explore"}
        onCheckedChange={(checked) => onChange(checked ? "explore" : "guided")}
        size="sm"
      />
    </div>
  )
}
