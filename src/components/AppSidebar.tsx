import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  TrendingUp,
  Calculator,
  FileText,
  Settings,
  Menu,
  Drill
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Cohorts", url: "/cohorts", icon: Users },
  { title: "Drivers", url: "/drivers", icon: TrendingUp },
  { title: "What-If", url: "/what-if", icon: Calculator },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Drill className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-sidebar-foreground">NeXTMatrix</h1>
              <p className="text-xs text-sidebar-foreground/70">Oil Bit Survival</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClasses}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status indicator */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>DEM Connected</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}