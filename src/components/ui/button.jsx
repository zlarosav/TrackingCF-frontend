import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-btn ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-active",
  {
    variants: {
      variant: {
        // Binance Yellow Primary
        default: "bg-primary text-on-primary hover:bg-primary-active rounded-md",
        // Binance Secondary surface
        secondary: "bg-surface-card text-on-surface hover:bg-surface-elevated rounded-md",
        // Outlined, transparent surface
        outline: "bg-canvas text-on-surface border border-hairline hover:bg-surface-elevated rounded-md",
        // Binance Tertiary Text
        ghost: "text-body hover:text-on-surface bg-transparent rounded-sm",
        // Binance Trading Up (green)
        destructive: "bg-trading-up text-white hover:opacity-90 rounded-sm",
        // Binance Trading Down (red)
        link: "bg-trading-down text-white hover:opacity-90 rounded-sm",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-3 text-body-md",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        // Subscribe (compact)
        xs: "h-7 px-4 text-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
