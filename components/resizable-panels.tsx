"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface ResizablePanelsProps {
  children: React.ReactNode[]
  direction?: "horizontal" | "vertical"
  initialSplit?: number
  minSize?: number
  maxSize?: number
}

export default function ResizablePanels({
  children,
  direction = "horizontal",
  initialSplit = 50,
  minSize = 20,
  maxSize = 80,
}: ResizablePanelsProps) {
  const [split, setSplit] = useState(initialSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const startPos = useRef(0)
  const startSplit = useRef(initialSplit)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerSize = direction === "horizontal" ? containerRect.width : containerRect.height

      const currentPos = direction === "horizontal" ? e.clientX : e.clientY
      const containerOffset = direction === "horizontal" ? containerRect.left : containerRect.top

      // Calculate position relative to container
      const relativePos = currentPos - containerOffset

      // Calculate new split percentage
      const newSplitPercent = (relativePos / containerSize) * 100

      // Apply constraints
      const constrainedSplit = Math.min(Math.max(minSize, newSplitPercent), maxSize)
      setSplit(constrainedSplit)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [direction, minSize, maxSize])

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true
    startPos.current = direction === "horizontal" ? e.clientX : e.clientY
    startSplit.current = split
    document.body.style.cursor = direction === "horizontal" ? "ew-resize" : "ns-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  if (children.length !== 2) {
    throw new Error("ResizablePanels component requires exactly 2 children")
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"} overflow-hidden flex-1`}
    >
      {/* First panel */}
      <div
        className="overflow-hidden"
        style={{
          [direction === "horizontal" ? "width" : "height"]: `${split}%`,
          [direction === "horizontal" ? "height" : "width"]: "100%",
        }}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        className={`${
          direction === "horizontal" ? "w-1 h-full cursor-ew-resize" : "h-1 w-full cursor-ns-resize"
        } bg-gray-200 hover:bg-indigo-500 flex-shrink-0 z-10`}
        onMouseDown={startResize}
      />

      {/* Second panel */}
      <div
        className="overflow-hidden"
        style={{
          [direction === "horizontal" ? "width" : "height"]: `${100 - split}%`,
          [direction === "horizontal" ? "height" : "width"]: "100%",
        }}
      >
        {children[1]}
      </div>
    </div>
  )
}
