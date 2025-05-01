"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"

interface LanguageStepProps {
  language: string
  updateLanguage: (language: string) => void
  onNext: () => void
  onBack: () => void
}

export default function LanguageStep({ language, updateLanguage, onNext, onBack }: LanguageStepProps) {
  const [languages, setLanguages] = useState<{ id: number; name: string; description?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    fetch("https://judge0-ce.p.rapidapi.com/languages", {
      headers: {
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setLanguages(
          data.map((lang: any) => ({ id: lang.id, name: lang.name }))
        )
        setLoading(false)
      })
      .catch(() => {
        setError("Could not fetch languages from Judge0")
        setLoading(false)
      })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="p-4 space-y-6 text-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100 font-mono text-center mb-1 tracking-widest uppercase">What's your coding language?</h2>
        <p className="text-slate-400 text-base text-center font-mono">I'll customize your learning journey based on your preference.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label className="text-base font-mono text-slate-300">Your Language</Label>
          {loading ? (
            <div className="text-center text-slate-400 font-mono py-4">Loading languages...</div>
          ) : error ? (
            <div className="text-center text-red-400 font-mono py-4">{error}</div>
          ) : (
            <RadioGroup value={language} onValueChange={updateLanguage} className="space-y-2 max-h-56 overflow-y-auto">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all text-sm ${
                    language === lang.name
                      ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-300 dark:border-violet-700"
                      : "bg-white/30 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-slate-800/50"
                  }`}
                >
                  <RadioGroupItem value={lang.name} id={lang.name} />
                  <div className="grid gap-0.5">
                    <Label htmlFor={lang.name} className="cursor-pointer text-base font-mono">
                      {lang.name}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="py-3 text-base font-mono border border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700">
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 py-3 text-base bg-slate-800 border border-slate-700 text-slate-200 font-mono rounded hover:bg-slate-700 transition-all duration-150"
            disabled={loading || !!error}
          >
            Next Step
          </Button>
        </div>
      </form>
    </div>
  )
}
