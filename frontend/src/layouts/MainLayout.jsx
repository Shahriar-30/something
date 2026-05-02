import { NavLink, Outlet } from "react-router-dom";
import {
  Layout,
  Users,
  PieChart,
  Layers,
  Settings,
  Search,
  Bell,
  Handshake,
  Activity,
  CreditCard,
  LifeBuoy,
  BarChart3,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }) =>
  cn(
    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all",
    isActive
      ? "bg-notion-light-gray text-primary border-l-2 border-primary rounded-l-none -ml-px"
      : "text-notion-dark hover:bg-notion-light-gray",
  );

export default function MainLayout() {
  return (
    <div className="h-screen bg-background text-foreground flex font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar - Zendesk style but Notion aesthetic */}
      <aside className="w-64 bg-notion-bg/50 border-r border-border hidden lg:flex flex-col shrink-0 h-full">
        <div className="p-6 flex items-center gap-2">
          <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-notion-black">
            Something CRM
          </span>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <NavLink to="/" end className={navClass}>
            <PieChart className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/contacts" className={navClass}>
            <Users className="w-4 h-4" />
            Contacts
          </NavLink>
          <NavLink to="/deals" className={navClass}>
            <Handshake className="w-4 h-4" />
            Deals
          </NavLink>
          <NavLink to="/billing" className={navClass}>
            <CreditCard className="w-4 h-4" />
            Billing
          </NavLink>
          <NavLink to="/activities" className={navClass}>
            <Activity className="w-4 h-4" />
            Activities
          </NavLink>
          <NavLink to="/support" className={navClass}>
            <LifeBuoy className="w-4 h-4" />
            Support
          </NavLink>
          <NavLink to="/reports" className={navClass}>
            <BarChart3 className="w-4 h-4" />
            Reports
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <NavLink to="/design-system" className={navClass}>
            <Layout className="w-4 h-4" />
            Design System
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border bg-notion-bg/20 space-y-4">
          <ThemeToggle />
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar status="online" className="h-8 w-8">
              JD
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-notion-black">
                John Doe
              </p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <header className="h-14 border-b border-border bg-background flex items-center px-6 justify-between sticky top-0 z-10 transition-colors duration-300">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted/50 border border-transparent rounded-md py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:bg-background focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border border-background"></span>
            </button>
            <Avatar className="h-8 w-8 cursor-pointer" status="online">
              JD
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
