import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-on-primary",
    secondary: "bg-surface-card-dark text-body border border-hairline-on-dark/60",
    destructive: "bg-trading-down text-on-dark",
    outline: "border border-hairline-on-dark/60 text-muted",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-caption font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
