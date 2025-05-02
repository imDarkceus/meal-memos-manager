
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MealTracking from "./pages/MealTracking";
import Expenses from "./pages/Expenses";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SidebarProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <AppProvider>
                        <Layout />
                      </AppProvider>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="members" element={<Members />} />
                  <Route path="meals" element={<MealTracking />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="report" element={<Report />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
