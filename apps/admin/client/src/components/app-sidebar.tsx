import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Rss, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Cpu,
  Database,
  Table2,
  Users,
  Plug2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "RSS Feeds", url: "/feeds", icon: Rss },
  { title: "Articles Queue", url: "/articles", icon: FileText },
  { title: "Stories", url: "/stories", icon: BookOpen },
  { title: "Forecasts", url: "/forecasts", icon: TrendingUp },
  { title: "Data Sources", url: "/data-sources", icon: Database },
  { title: "Datasets", url: "/datasets", icon: Table2 },
  { title: "Integrations", url: "/integrations", icon: Plug2 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Agents", url: "/agents", icon: Cpu },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-signature flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/20">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground leading-none">Probable</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-1">Data Desk</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
