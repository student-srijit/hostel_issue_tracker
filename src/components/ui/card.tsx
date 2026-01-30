import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glass?: boolean
    hover?: boolean
    gradient?: "primary" | "success" | "warning" | "danger" | "purple"
  }
>(({ className, glass, hover, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group card-neon card-tilt scroll-fade rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
      glass && "bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-white/30 dark:border-gray-700/30",
      hover && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
      gradient === "primary" && "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/50",
      gradient === "success" && "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-800/50",
      gradient === "warning" && "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/50 dark:border-yellow-800/50",
      gradient === "danger" && "bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-200/50 dark:border-red-800/50",
      gradient === "purple" && "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 dark:border-purple-800/50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
