"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn, getInitials } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "xs" | "sm" | "md" | "lg" | "xl"
  }
>(({ className, size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      size === "xs" && "h-6 w-6",
      size === "sm" && "h-8 w-8",
      size === "md" && "h-10 w-10",
      size === "lg" && "h-12 w-12",
      size === "xl" && "h-16 w-16",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

interface UserAvatarProps {
  name?: string
  image?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  showStatus?: boolean
  status?: "online" | "offline" | "busy"
}

const UserAvatar = ({ name, image, size = "md", className, showStatus, status = "offline" }: UserAvatarProps) => {
  return (
    <div className="relative">
      <Avatar size={size} className={className}>
        {image ? (
          <AvatarImage src={image} alt={name || "User"} />
        ) : null}
        <AvatarFallback>{getInitials(name || "U")}</AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            size === "xs" && "h-1.5 w-1.5",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3",
            size === "xl" && "h-4 w-4",
            status === "online" && "bg-green-500",
            status === "offline" && "bg-gray-400",
            status === "busy" && "bg-red-500"
          )}
        />
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
