import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  Layout,
  Users,
  PieChart,
  Settings,
  Search,
  Bell,
  Handshake,
  Activity,
  CreditCard,
  LifeBuoy,
  BarChart3,
  ChevronDown,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";

const navClass = ({ isActive }) =>
  cn(
    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all",
    isActive
      ? "bg-notion-light-gray text-primary border-l-2 border-primary rounded-l-none -ml-px"
      : "text-notion-dark hover:bg-notion-light-gray",
  );

export default function MainLayout() {
  const { user, activeBusiness, businesses } = useAuthStore();
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSwitchBusiness = (newBusinessId) => {
    // Navigating to the new businessId URL will trigger the BusinessContextSync component
    // to perform the switchBusiness API call and update the token.
    navigate(`/${newBusinessId}`, { replace: true });
    setIsBusinessMenuOpen(false);
  };

  return (
    <div className="h-screen bg-background text-foreground flex font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar - Zendesk style but Notion aesthetic */}
      <aside className="w-64 bg-notion-bg/50 border-r border-border hidden lg:flex flex-col shrink-0 h-full relative">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setIsBusinessMenuOpen(!isBusinessMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-notion-light-gray transition-colors group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-xs shrink-0">
                {activeBusiness?.name?.[0] || "S"}
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-sm font-bold tracking-tight text-notion-black truncate w-full">
                  {activeBusiness?.name || "Something CRM"}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {activeBusiness?.role || "Owner"}
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isBusinessMenuOpen && "rotate-180",
              )}
            />
          </button>

          {/* Business Switcher Menu */}
          {isBusinessMenuOpen && (
            <div className="absolute top-16 left-4 right-4 bg-background border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 border-b border-border mb-1">
                Switch Business
              </div>
              <div className="max-h-60 overflow-y-auto">
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => handleSwitchBusiness(biz.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
                      biz.id === businessId &&
                        "bg-primary/5 text-primary font-medium",
                    )}
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-sm flex items-center justify-center text-[10px] font-bold",
                        biz.id === businessId
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {biz.name[0]}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="truncate">{biz.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {biz.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-border mt-1 pt-1">
                <NavLink
                  to={`/${businessId}/settings/business`}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsBusinessMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  Business Settings
                </NavLink>
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <NavLink to={`/${businessId}`} end className={navClass}>
            <PieChart className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to={`/${businessId}/contacts`} className={navClass}>
            <Users className="w-4 h-4" />
            Contacts
          </NavLink>
          <NavLink to={`/${businessId}/deals`} className={navClass}>
            <Handshake className="w-4 h-4" />
            Deals
          </NavLink>
          <NavLink to={`/${businessId}/billing`} className={navClass}>
            <CreditCard className="w-4 h-4" />
            Billing
          </NavLink>
          <NavLink to={`/${businessId}/activities`} className={navClass}>
            <Activity className="w-4 h-4" />
            Activities
          </NavLink>
          <NavLink to={`/${businessId}/support`} className={navClass}>
            <LifeBuoy className="w-4 h-4" />
            Support
          </NavLink>
          <NavLink to={`/${businessId}/reports`} className={navClass}>
            <BarChart3 className="w-4 h-4" />
            Reports
          </NavLink>
          <NavLink to={`/${businessId}/settings`} className={navClass}>
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <NavLink to={`/${businessId}/design-system`} className={navClass}>
            <Layout className="w-4 h-4" />
            Design System
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border bg-notion-bg/20">
          <ThemeToggle />
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
              {getInitials(user?.name)}
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
