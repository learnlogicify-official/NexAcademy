import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chartContainerVariants = cva("rounded-md border", {
  variants: {
    variant: {
      default: "bg-background shadow",
      card: "bg-card",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const chartTooltipContentVariants = cva("rounded-md border bg-popover p-4 text-popover-foreground shadow-sm", {
  variants: {
    side: {
      top: "animate-slide-down fade-in-0",
      bottom: "animate-slide-up fade-in-0",
      left: "animate-slide-right fade-in-0",
      right: "animate-slide-left fade-in-0",
    },
  },
  defaultVariants: {
    side: "bottom",
  },
})

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chartContainerVariants>
>(({ className, variant, ...props }, ref) => (
  <div className={cn(chartContainerVariants({ variant, className }))} ref={ref} {...props} />
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("relative", className)} ref={ref} {...props} />,
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartTooltipContentVariants> {
  content?: React.ReactNode
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, side, content, ...props }, ref) => {
    if (!content) {
      return null
    }

    return (
      <div className={cn(chartTooltipContentVariants({ side, className }))} ref={ref} {...props}>
        {content}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
export const Chart = ChartContainer

