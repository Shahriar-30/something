import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", showDot = true, ...props }) {
  const variants = {
    default: "border-transparent bg-primary/10 text-primary",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive/10 text-destructive",
    outline: "text-foreground border-border",
  };

  const dotColors = {
    default: "bg-primary",
    secondary: "bg-muted-foreground",
    destructive: "bg-destructive",
    outline: "bg-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {props.children}
    </div>
  );
}

export { Badge };
