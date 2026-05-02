import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground border-border",
      success:
        "bg-primary/5 text-primary border-primary/20 [&>svg]:text-primary",
      destructive:
        "bg-destructive/5 text-destructive border-destructive/20 [&>svg]:text-destructive",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-md border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
