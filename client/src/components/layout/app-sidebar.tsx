import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { 
  Building2, 
  LayoutDashboard, 
  Ticket, 
  ScanLine, 
  BarChart3, 
  Settings, 
  LogOut,
  Map,
  Users,
  FileText
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
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();

  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'SUB_ADMIN';

  const businessRoutes = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Issue Coupon", url: "/coupons/issue", icon: Ticket },
    { title: "Redeem Coupon", url: "/coupons/redeem", icon: ScanLine },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const adminRoutes = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Clusters", url: "/admin/clusters", icon: Map },
    { title: "Businesses", url: "/admin/businesses", icon: Building2 },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Reports", url: "/admin/reports", icon: FileText },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const routes = isAdmin ? adminRoutes : businessRoutes;

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2 py-1.5 text-primary">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">ClusterGrowth</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase text-muted-foreground/70 tracking-wider mb-2">
            {isAdmin ? "Administration" : "Business Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => {
                const isActive = location === route.url || location.startsWith(route.url + '/');
                return (
                  <SidebarMenuItem key={route.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={route.title}>
                      <Link href={route.url} className={`transition-all duration-200 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                        <route.icon className={isActive ? 'text-primary' : ''} />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground truncate">{isAdmin ? 'Administrator' : 'Business Owner'}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
