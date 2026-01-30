import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  showCount?: boolean
  maxCount?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxCount, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
      if (typeof value === "string") {
        setCount(value.length)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none",
            error && "border-destructive focus-visible:ring-destructive",
            showCount && "pb-8",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCount && (
          <div
            className={cn(
              "absolute bottom-2 right-3 text-xs text-muted-foreground",
              maxCount && count > maxCount && "text-destructive"
            )}
          >
            {count}{maxCount && `/${maxCount}`}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
