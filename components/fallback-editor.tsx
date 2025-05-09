"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface FallbackEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
}

export function FallbackEditor({ code, setCode, language }: FallbackEditorProps) {
  const [value, setValue] = useState(code)

  useEffect(() => {
    setValue(code)
  }, [code])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    setCode(e.target.value)
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
        <span className="text-sm font-medium">Basic Editor (Monaco failed to load)</span>
        <span className="text-xs text-gray-500">{language}</span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          minHeight: "300px",
          height: "100%",
          width: "100%",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
        }}
        spellCheck="false"
        placeholder="// Write your code here"
      />
    </div>
  )
}
