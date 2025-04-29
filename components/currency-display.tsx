import Image from "next/image"
import { cn } from "@/lib/utils"

interface CurrencyDisplayProps {
  type: "xp" | "coins"
  value: number
  className?: string
}

export function CurrencyDisplay({ type, value, className }: CurrencyDisplayProps) {
  const formattedValue = value.toLocaleString()

  // Swap the icons - coin icon for XP and XP icon for coins
  const icon = type === "xp" ? "/icons/coin-icon.svg" : "/icons/xp-icon.svg"
  const label = type === "xp" ? "XP" : "Coins"

  // Different styling based on currency type
  const bgColor =
    type === "xp"
      ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20"
      : "bg-gradient-to-r from-amber-400/20 to-yellow-300/20"

  const textColor = type === "xp" ? "text-amber-400" : "text-yellow-300"

  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5", bgColor, className)}>
      <Image src={icon || "/placeholder.svg"} alt={label} width={16} height={16} className="h-4 w-4" />
      <span className={cn("text-xs font-medium", textColor)}>
        {formattedValue} {label}
      </span>
    </div>
  )
}
