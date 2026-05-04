import React from "react";
import { cn } from "@/lib/utils";

/**
 * PageContainer
 * Standardized container for all pages to enforce consistent padding and max-width.
 * Spacing Guide:
 * - Mobile: 16px (p-4)
 * - Tablet: 24px (md:p-6)
 * - Desktop: 32px (lg:p-8)
 */
export const PageContainer = React.forwardRef(
  ({ children, className, maxWidth = "7xl", ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-7xl",
      full: "max-w-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 w-full mx-auto",
          "p-4 md:p-6 lg:p-8", // Responsive padding
          "space-y-6 md:space-y-8", // Vertical spacing between children
          maxWidthClasses[maxWidth] || maxWidthClasses.lg,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";

/**
 * PageHeader
 * Consistent header section for titles, descriptions, and actions.
 */
export const PageHeader = ({ title, description, actions, children, className }) => {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-notion-black">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * PageContent
 * Wrapper for the main content area of a page.
 */
export const PageContent = ({ children, className }) => {
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-500", className)}>
      {children}
    </div>
  );
};

/**
 * PageFooter
 * Standardized footer section for pages.
 */
export const PageFooter = ({ children, className }) => {
  return (
    <div className={cn("pt-6 mt-8 border-t border-border text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
};
