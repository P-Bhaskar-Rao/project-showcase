import { useState, useEffect } from "react"; // Import useState and useEffect
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AuthSuccessHandler from "./pages/AuthSuccessHandler"; // Import the new component
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/api/axiosInstance";
import DashboardWrapper from "./components/DashboardWrapper";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage"; // Import the new ProjectPage component

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const [isLoading, setIsLoading] = useState(true);
  const [userProjects] = useState([]);
  const [favoriteProjects] = useState([]);
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await axiosInstance.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

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
        setInitialized(true);
      }
    };

    refreshSession();
  }, [setAuth, clearAuth, setInitialized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  const handleSubmitProject = () => {
    // This will be handled by the individual pages
    console.log("Project submission triggered");
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Adjusted dimensions for Toaster and Sonner */}
        <Toaster className="z-[9999] max-w-xs text-sm" />
        <Sonner className="z-[9998] max-w-xs text-sm" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectPage />} /> {/* New route for ProjectPage */}
            {/* <Route path="/dashboard" element={<div style={{padding: '2rem', textAlign: 'center'}}>Dashboard temporarily disabled for maintenance.</div>} /> */}
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
