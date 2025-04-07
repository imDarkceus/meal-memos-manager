
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, User, Calendar, DollarSign, Rocket, FileText } from "lucide-react";

const AppSidebar = () => {
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: User, label: "Members", path: "/members" },
    { icon: Calendar, label: "Meal Tracking", path: "/meals" },
    { icon: DollarSign, label: "Expenses", path: "/expenses" },
    { icon: FileText, label: "Report", path: "/report" },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="py-4 px-6 border-b flex items-center gap-2">
          <Rocket className="h-6 w-6 text-app-blue" />
          <h2 className="text-xl font-bold text-app-blue">Area 51</h2>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive ? "text-app-blue font-medium" : "text-foreground hover:text-app-blue"
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
