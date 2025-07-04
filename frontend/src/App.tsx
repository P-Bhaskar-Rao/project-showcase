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
import DashboardWrapper from "./components/DashboardWrapper";

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL;

// Mock data - in a real app this would come from a backend/context
const mockUserProjects = [
  {
    id: "1",
    name: "E-commerce Platform",
    description:
      "A full-stack e-commerce platform built with React and Node.js",
    author: "John Doe",
    techStack: ["React", "Node.js", "MongoDB", "Express"],
    category: "Web Development",
    githubUrl: "https://github.com/johndoe/ecommerce",
    liveUrl: "https://ecommerce-demo.com",
    internshipPeriod: "Jun 2024 - Aug 2024",
    projectType: "internship",
    companyName: "TechCorp Inc.",
  },
];

const mockFavoriteProjects = [
  {
    id: "2",
    name: "Weather App",
    description: "A beautiful weather application with real-time updates",
    author: "Jane Smith",
    techStack: ["React", "API Integration", "CSS"],
    category: "Mobile App",
    githubUrl: "https://github.com/janesmith/weather",
    liveUrl: "https://weather-app-demo.com",
    internshipPeriod: "May 2024 - Jul 2024",
    projectType: "personal",
  },
];

const App = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [userProjects] = useState(mockUserProjects);
  const [favoriteProjects] = useState(mockFavoriteProjects);
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await axios.post(
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
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <DashboardWrapper
                  userProjects={userProjects}
                  favoriteProjects={favoriteProjects}
                  onSubmitProject={handleSubmitProject}
                />
              }
            />
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
