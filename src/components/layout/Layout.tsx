
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="font-semibold text-lg text-foreground">Area 51</h1>
            </div>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
