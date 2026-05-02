import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, status = "offline", ...props }, ref) => {
  const statusColors = {
    online: "bg-primary",
    away: "bg-amber-500",
    busy: "bg-destructive",
    offline: "bg-muted-foreground",
  }

  return (
    <div className="relative inline-block">
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium">
          {props.children || "U"}
        </div>
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
            statusColors[status]
          )}
        />
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

export { Avatar }
