import { useState, useEffect } from "react"; // Import useState and useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AuthSuccessHandler from "./pages/AuthSuccessHandler"; // Import the new component
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true
        });

        if (response.data.success) {
          const { user, accessToken } = response.data;
          setAuth(user, accessToken);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Session refresh failed:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    refreshSession();
  }, [setAuth, clearAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Adjusted dimensions for Toaster and Sonner */}
        <Toaster className="z-[9999] max-w-xs text-sm" /> 
        <Sonner className="z-[9998] max-w-xs text-sm" /> 
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth-success" element={<AuthSuccessHandler />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
