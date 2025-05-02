
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Layout = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Add loading effect when switching routes
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [location.pathname]);

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
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(currentTime, "PPP")}</span>
              <span className="hidden md:inline mx-1">|</span>
              <span className="hidden md:inline">{format(currentTime, "p")}</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-2 md:p-4">
          {isLoading ? (
            <div className="animate-fade-in space-y-4 w-full">
              <Skeleton className="h-12 w-full max-w-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40 hidden lg:block" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="animate-fade-in">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
