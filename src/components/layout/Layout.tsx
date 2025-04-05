
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen flex w-full bg-app-gray-light">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center px-4">
          <SidebarTrigger />
          <div className="ml-4">
            <h1 className="font-semibold text-lg text-gray-800">Meal Memos Manager</h1>
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
