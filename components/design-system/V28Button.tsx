import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface V28ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode | (() => ReactNode)
  iconPosition?: "left" | "right"
}

export const V28Button = forwardRef<HTMLButtonElement, V28ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, iconPosition = "left", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
      secondary: "bg-card text-foreground border border-border hover:bg-muted focus:ring-primary",
      ghost: "bg-transparent text-foreground hover:bg-muted focus:ring-primary",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
      outline: "bg-transparent text-foreground border border-border hover:bg-muted focus:ring-primary",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    const renderIcon = () => {
      if (!icon) return null
      return typeof icon === "function" ? icon() : icon
    }

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </button>
    )
  },
)

V28Button.displayName = "V28Button"
