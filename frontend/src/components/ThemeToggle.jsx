import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "@/providers/ThemeProvider"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-md border border-border", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 rounded-sm transition-all",
          theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 rounded-sm transition-all",
          theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 rounded-sm transition-all",
          theme === "system" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setTheme("system")}
        aria-label="System mode"
      >
        <Laptop className="h-4 w-4" />
      </Button>
    </div>
  )
}
