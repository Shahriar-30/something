import { NavLink, Outlet } from "react-router-dom";
import { Layout, Users, PieChart, Layers, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }) =>
  cn(
    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all",
    isActive
      ? "bg-notion-light-gray text-primary border-l-2 border-primary rounded-l-none -ml-px"
      : "text-notion-dark hover:bg-notion-light-gray"
  );

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar - Zendesk style but Notion aesthetic */}
      <aside className="w-64 bg-notion-bg/50 border-r border-border hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="text-lg font-bold tracking-tight text-notion-black">
            Something CRM
          </span>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          <NavLink to="/" end className={navClass}>
            <PieChart className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/contacts" className={navClass}>
            <Users className="w-4 h-4" />
            Contacts
          </NavLink>
          <NavLink to="/design-system" className={navClass}>
            <Layout className="w-4 h-4" />
            Design System
          </NavLink>
          
          <div className="pt-6 pb-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Sales
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-notion-dark hover:bg-notion-light-gray transition-all">
            <Layers className="w-4 h-4 text-notion-gray" />
            Leads
          </button>
        </nav>
        
        <div className="p-4 border-t border-border bg-notion-bg/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar status="online" className="h-8 w-8">JD</Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-notion-black">John Doe</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Administrator</p>
            </div>
            <Settings className="w-4 h-4 text-notion-gray cursor-pointer hover:text-notion-black transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
