import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-card", className)}
      {...props}
    />
  )
}

export { Skeleton }
