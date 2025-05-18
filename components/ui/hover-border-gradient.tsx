"use client"
import type React from "react"
import { useState, useEffect } from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  disabled = false,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType
    containerClassName?: string
    className?: string
    duration?: number
    clockwise?: boolean
    disabled?: boolean
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [direction, setDirection] = useState<Direction>("TOP")

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
    const currentIndex = directions.indexOf(currentDirection)
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length
    return directions[nextIndex]
  }

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(25% 60% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(20% 50% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM: "radial-gradient(25% 60% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT: "radial-gradient(20% 50% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
  }

  const highlight = "radial-gradient(80% 180% at 50% 50%, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.7) 35%, rgba(236, 72, 153, 0.5) 70%, transparent 100%)"

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState))
      }, duration * 1000)
      return () => clearInterval(interval)
    }
  }, [hovered, duration])

  return (
    <Tag
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/5 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName,
      )}
      disabled={disabled}
      {...props}
    >
      <div 
        className={cn(
          "w-auto text-white z-10 bg-black px-5 py-2.5 rounded-[inherit] transition-all duration-300", 
          className,
          hovered && !disabled ? "transform scale-[1.03]" : ""
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn("flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]")}
        style={{
          filter: "blur(3px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered && !disabled ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "easeOut", duration: duration ?? 1 }}
      />
      <div 
        className="bg-[#0F0F11] absolute z-1 flex-none inset-[1.5px] rounded-[100px]" 
        style={{
          boxShadow: hovered && !disabled 
            ? "inset 0 0 15px rgba(99, 102, 241, 0.2), inset 0 0 5px rgba(139, 92, 246, 0.1)" 
            : "none",
          transition: "box-shadow 0.3s ease"
        }}
      />
    </Tag>
  )
}