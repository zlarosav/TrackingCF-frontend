import * as React from "react"
import { cn } from "@/lib/utils"

const IconButton = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center h-10 w-10 rounded-full bg-surface-card text-body hover:text-on-surface hover:bg-surface-elevated transition-all btn-active",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
IconButton.displayName = "IconButton"

export { IconButton }
