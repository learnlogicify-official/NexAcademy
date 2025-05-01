"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UsernameStepProps {
  username: string
  updateUsername: (username: string) => void
  onNext: () => void
}

export default function UsernameStep({ username, updateUsername, onNext }: UsernameStepProps) {
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)
  const [isUnique, setIsUnique] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Live uniqueness check
  useEffect(() => {
    setIsUnique(false)
    setError("")
    if (!username || username.length < 3) return
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return
    setChecking(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        if (data.available) {
          setIsUnique(true)
          setError("")
        } else {
          setIsUnique(false)
          setError("Username is already taken")
        }
      } catch {
        setIsUnique(false)
        setError("Could not check username")
      } finally {
        setChecking(false)
      }
    }, 400)
    // eslint-disable-next-line
  }, [username])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username is required")
      return
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens")
      return
    }
    if (!isUnique) {
      setError("Username is already taken")
      return
    }
    setError("")
    onNext()
  }

  return (
    <div className="panel p-8 space-y-8">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-100 font-mono text-center mb-2 tracking-widest uppercase">
          What should I call you?
        </h2>
        <p className="text-slate-400 text-lg text-center font-mono">
          Pick a username that represents your vibe in our community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-base font-mono text-slate-300">
            Username
          </Label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400 font-mono text-lg select-none pointer-events-none">@</span>
            <Input
              id="username"
              placeholder="e.g., code_ninja, tech_wizard"
              value={username}
              onChange={(e) => {
                updateUsername(e.target.value)
                if (error) setError("")
              }}
              className={`pl-10 bg-slate-900 text-slate-100 border font-mono focus:ring-2 focus:ring-cyan-500/40 text-base py-6 ${
                error
                  ? "border-red-500"
                  : isUnique && username.length >= 3
                  ? "border-green-500"
                  : "border-slate-700"
              }`}
              autoComplete="off"
            />
          </div>
          {checking && <p className="text-sm text-cyan-400 mt-1 font-mono">Checking username...</p>}
          {error && <p className="text-sm text-red-500 mt-1 font-mono">{error}</p>}
          {isUnique && !error && username.length >= 3 && (
            <p className="text-sm text-green-400 mt-1 font-mono">Username is available!</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-base bg-slate-800 border border-slate-700 text-slate-200 font-mono rounded hover:bg-slate-700 transition-all duration-150"
          disabled={
            !username ||
            username.length < 3 ||
            !/^[a-zA-Z0-9_-]+$/.test(username) ||
            !isUnique ||
            checking
          }
        >
          Let's Go <span className="ml-1">🚀</span>
        </Button>
      </form>
    </div>
  )
}
