import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ className, defaultValue, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab })
        }
        return child;
      })}
    </div>
  )
}

const TabsList = ({ className, activeTab, setActiveTab, children, ...props }) => (
  <div
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, setActiveTab })
      }
      return child;
    })}
  </div>
)

const TabsTrigger = ({ className, value, activeTab, setActiveTab, ...props }) => (
  <button
    onClick={() => setActiveTab(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value
        ? "bg-background text-foreground shadow-sm"
        : "hover:text-foreground",
      className
    )}
    {...props}
  />
)

const TabsContent = ({ className, value, activeTab, ...props }) => (
  activeTab === value ? (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  ) : null
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
