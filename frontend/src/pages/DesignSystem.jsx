import React, { useState } from "react";
import {
  Plus,
  Search,
  Bell,
  Settings,
  User,
  Mail,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Filter,
  Layout,
  Type,
  Palette,
  Move,
  Box,
  Layers,
  Grid,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Hash,
  Image,
  FileText,
  Calendar,
  Link2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Progress } from "@/components/ui/Progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";

const Section = ({ id, title, children, description }) => (
  <section id={id} className="mb-16 scroll-mt-20">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-notion-black mb-1">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <Separator className="mt-4" />
    </div>
    {children}
  </section>
);

const ColorSwatch = ({ color, name, hex }) => (
  <div className="flex flex-col gap-2">
    <div
      className={cn("h-16 w-full rounded-md border border-border", color)}
      style={hex ? { backgroundColor: hex } : {}}
    />
    <div>
      <p className="text-xs font-medium text-notion-black">{name}</p>
      <p className="text-[10px] font-mono text-muted-foreground uppercase">
        {hex || "CSS Var"}
      </p>
    </div>
  </div>
);

const DesignSystem = () => {
  const [activeSidebar, setActiveSidebar] = useState("colors");
  const [switchChecked, setSwitchChecked] = useState(true);

  const sidebarItems = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "spacing", label: "Spacing", icon: Move },
    { id: "buttons", label: "Buttons", icon: Box },
    { id: "badges", label: "Badges", icon: Tag },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "avatars", label: "Avatars", icon: User },
    { id: "alerts", label: "Alerts & Toasts", icon: AlertCircle },
    { id: "data", label: "Data & Stats", icon: Layers },
    { id: "app-shell", label: "App Shell", icon: Layout },
    { id: "radius", label: "Border Radius", icon: Box },
    { id: "icons", label: "Icon Grid", icon: Grid },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar TOC - Notion/Zendesk inspired */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-notion-bg/50 overflow-y-auto hidden lg:block">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center text-white font-bold text-xs">
                S
              </div>
              <span className="font-semibold text-notion-black tracking-tight">
                Design System
              </span>
            </div>
          </div>

          <div className="mb-6 px-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Theme
            </p>
            <ThemeToggle />
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSidebar(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors group",
                  activeSidebar === item.id
                    ? "bg-notion-light-gray text-primary border-l-2 border-primary rounded-l-none -ml-px"
                    : "text-notion-dark hover:bg-notion-light-gray",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    activeSidebar === item.id
                      ? "text-primary"
                      : "text-notion-gray",
                  )}
                />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8 lg:p-16 max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-notion-black mb-4">
            Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A combination of Zendesk's functional layout and Notion's minimal
            aesthetic. Built with a 4px grid, DM Sans typography, and #5BBF4E as
            the primary accent.
          </p>
        </div>

        {/* 1. Colors */}
        <Section
          id="colors"
          title="Colors"
          description="Shadcn-compatible semantic tokens and brand palette."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorSwatch name="Primary" color="bg-primary" hex="#5BBF4E" />
            <ColorSwatch
              name="Foreground"
              color="bg-foreground"
              hex="#37352F"
            />
            <ColorSwatch
              name="Background"
              color="bg-background"
              hex="#FFFFFF"
            />
            <ColorSwatch name="Muted" color="bg-muted" hex="#F1F1EF" />
            <ColorSwatch name="Border" color="bg-border" hex="#E9E9E7" />
            <ColorSwatch
              name="Destructive"
              color="bg-destructive"
              hex="#EB5757"
            />
            <ColorSwatch
              name="Notion Black"
              color="bg-notion-black"
              hex="#1A1A1A"
            />
            <ColorSwatch
              name="Notion Gray"
              color="bg-notion-gray"
              hex="#787774"
            />
          </div>
        </Section>

        {/* 2. Typography */}
        <Section
          id="typography"
          title="Typography"
          description="DM Sans for UI and DM Mono for metadata."
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Heading 1 / 36px</h1>
              <h2 className="text-3xl font-bold">Heading 2 / 30px</h2>
              <h3 className="text-2xl font-bold">Heading 3 / 24px</h3>
              <h4 className="text-xl font-bold">Heading 4 / 20px</h4>
              <p className="text-base">
                Body Base / 16px - Notion's standard text size for readability.
              </p>
              <p className="text-sm">
                Body Small / 14px - Used for sidebars and secondary info.
              </p>
              <p className="text-xs">Caption / 12px - Smallest legible text.</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="font-mono text-xs uppercase mb-2 text-muted-foreground tracking-wider">
                Metadata (DM Mono)
              </p>
              <p className="font-mono text-sm text-notion-dark">
                TICKET-1024 / CREATED 2024-05-02 / PRIORITY: HIGH
              </p>
            </div>
          </div>
        </Section>

        {/* 3. Spacing */}
        <Section
          id="spacing"
          title="Spacing"
          description="4px base grid system for consistent density."
        >
          <div className="space-y-4">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className="w-12 text-xs font-mono text-muted-foreground">
                  --s-{s}
                </div>
                <div
                  className="h-4 bg-primary/20 border-r border-primary"
                  style={{ width: `${s * 4}px` }}
                />
                <div className="text-xs text-notion-dark">{s * 4}px</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Buttons */}
        <Section
          id="buttons"
          title="Buttons"
          description="Minimalist variants with sharp focus states."
        >
          <div className="flex flex-wrap gap-4 items-end">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Section>

        {/* 5. Badges */}
        <Section
          id="badges"
          title="Badges"
          description="Status indicators and priority tags."
        >
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="outline">Tag</Badge>
            <Badge variant="destructive">Urgent</Badge>
            <Badge className="bg-blue-100 text-blue-700 border-transparent">
              Open
            </Badge>
            <Badge className="bg-primary/20 text-primary border-transparent">
              Resolved
            </Badge>
          </div>
        </Section>

        {/* 6. Forms */}
        <Section
          id="forms"
          title="Forms"
          description="Zero-shadow, border-only input elements."
        >
          <div className="max-w-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <Input placeholder="Enter your email" />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
              />
              <label className="text-sm">Enable notifications</label>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary h-4 w-4" />
                <label className="text-sm">Checkbox</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" className="accent-primary h-4 w-4" />
                <label className="text-sm">Radio</label>
              </div>
            </div>
          </div>
        </Section>

        {/* 7. Avatars */}
        <Section
          id="avatars"
          title="Avatars"
          description="Presence indicators for agents."
        >
          <div className="flex gap-6">
            <Avatar status="online">JD</Avatar>
            <Avatar status="away">AS</Avatar>
            <Avatar status="busy">MK</Avatar>
            <Avatar status="offline">TH</Avatar>
          </div>
        </Section>

        {/* 8. Alerts */}
        <Section
          id="alerts"
          title="Alerts & Toasts"
          description="Unobtrusive feedback components."
        >
          <div className="space-y-4">
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your changes have been saved successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* 9. Data & Stats */}
        <Section
          id="data"
          title="Data & Stats"
          description="Dense data presentation."
        >
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-mono uppercase">
                    Total Tickets
                  </CardDescription>
                  <CardTitle className="text-2xl">1,284</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={75} className="h-1" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-mono uppercase">
                    SLA Success
                  </CardDescription>
                  <CardTitle className="text-2xl">98.2%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={98} className="h-1" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-mono uppercase">
                    Avg. Wait
                  </CardDescription>
                  <CardTitle className="text-2xl">4m 12s</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={45} className="h-1" />
                </CardContent>
              </Card>
            </div>

            <div className="border border-border rounded-md overflow-hidden bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: "INC-4001",
                      subject: "Payment gateway integration failure",
                      priority: "High",
                      status: "OPEN",
                      date: "2024-05-02",
                    },
                    {
                      id: "INC-4002",
                      subject: "User session timeout issue",
                      priority: "Normal",
                      status: "PENDING",
                      date: "2024-05-01",
                    },
                    {
                      id: "INC-4003",
                      subject: "Dashboard loading slow in Safari",
                      priority: "Low",
                      status: "RESOLVED",
                      date: "2024-04-30",
                    },
                  ].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{row.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.subject}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-1 h-4 rounded-full",
                              row.priority === "High"
                                ? "bg-destructive"
                                : row.priority === "Normal"
                                  ? "bg-amber-500"
                                  : "bg-primary",
                            )}
                          />
                          {row.priority}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === "RESOLVED"
                              ? "default"
                              : row.status === "PENDING"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-[10px]"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {row.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>
                  A list of your recent support tickets.
                </TableCaption>
              </Table>
            </div>
          </div>
        </Section>

        {/* 10. App Shell Mockup */}
        <Section
          id="app-shell"
          title="App Shell Mockup"
          description="Zendesk layout with Notion aesthetics."
        >
          <div className="border border-border rounded-lg overflow-hidden h-[600px] flex bg-background shadow-2xl scale-[0.95] origin-top">
            {/* Zendesk-style Sticky Sidebar */}
            <div className="w-14 bg-notion-black flex flex-col items-center py-4 gap-4">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                Z
              </div>
              <div className="h-8 w-8 bg-white/10 rounded-md flex items-center justify-center text-white/60">
                <Inbox className="h-4 w-4" />
              </div>
              <div className="h-8 w-8 bg-primary/20 text-primary border-l-2 border-primary rounded-l-none flex items-center justify-center -mr-px">
                <User className="h-4 w-4" />
              </div>
              <div className="h-8 w-8 bg-white/10 rounded-md flex items-center justify-center text-white/60">
                <Search className="h-4 w-4" />
              </div>
              <div className="mt-auto h-8 w-8 bg-white/10 rounded-md flex items-center justify-center text-white/60">
                <Settings className="h-4 w-4" />
              </div>
            </div>

            {/* Ticket List Area */}
            <div className="w-80 border-r border-border flex flex-col bg-notion-bg/20">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Views</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">
                  Shared Views
                </div>
                <div className="px-3 py-2 text-sm bg-primary/10 text-primary border-l-2 border-primary font-medium">
                  All unsolved tickets
                </div>
                <div className="px-3 py-2 text-sm hover:bg-notion-light-gray cursor-pointer transition-colors">
                  Recently updated
                </div>
                <div className="px-3 py-2 text-sm hover:bg-notion-light-gray cursor-pointer transition-colors">
                  Assigned to me
                </div>
                <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">
                  Personal
                </div>
                <div className="px-3 py-2 text-sm hover:bg-notion-light-gray cursor-pointer transition-colors">
                  My reminders
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              <header className="h-12 border-b border-border flex items-center px-6 justify-between bg-background">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>#INC-4001</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-7 w-7" status="online">
                    JD
                  </Avatar>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 bg-background">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700"
                    >
                      HIGH PRIORITY
                    </Badge>
                    <Badge variant="outline">OPEN</Badge>
                  </div>
                  <h2 className="text-3xl font-bold mb-6">
                    Payment gateway integration failure in production
                  </h2>

                  <div className="space-y-8">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Avatar className="h-8 w-8 mt-1">JD</Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              Jane Doe
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              2h ago
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-notion-dark">
                            I've investigated the logs and it seems like the API
                            key for the sandbox environment was accidentally
                            used in the production build. I'm preparing a fix
                            now.
                          </p>
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Reply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Note
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 11. Radius */}
        <Section
          id="radius"
          title="Border Radius"
          description="Consistent rounded corners across components."
        >
          <div className="flex gap-8 items-center">
            <div className="space-y-2">
              <div className="h-20 w-20 bg-muted border border-border rounded-[2px]" />
              <p className="text-xs font-mono text-center">2px</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-20 bg-muted border border-border rounded-[4px]" />
              <p className="text-xs font-mono text-center">4px (--radius)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-20 bg-muted border border-border rounded-[8px]" />
              <p className="text-xs font-mono text-center">8px</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-20 bg-muted border border-border rounded-full" />
              <p className="text-xs font-mono text-center">Full</p>
            </div>
          </div>
        </Section>

        {/* 12. Icons */}
        <Section
          id="icons"
          title="Icon Grid"
          description="Selected iconography for CRM and Productivity."
        >
          <div className="grid grid-cols-6 md:grid-cols-10 gap-6">
            {[
              Search,
              Bell,
              Settings,
              User,
              Mail,
              Inbox,
              CheckCircle2,
              AlertCircle,
              Clock,
              Tag,
              Filter,
              Layout,
              Type,
              Palette,
              Move,
              Box,
              Layers,
              Grid,
              MoreVertical,
              ChevronDown,
              Hash,
              Image,
              FileText,
              Calendar,
              Link2,
              ExternalLink,
              ChevronRight,
              Plus,
            ].map((Icon, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="p-3 rounded-md border border-border group-hover:border-primary group-hover:bg-primary/5 transition-all">
                  <Icon className="h-5 w-5 text-notion-dark group-hover:text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono truncate w-full text-center">
                  {Icon.displayName || Icon.name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <footer className="mt-20 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Built with Zendesk + Notion Philosophy. 2026.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default DesignSystem;
