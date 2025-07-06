import React from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";

interface Project {
  id: string;
  name: string;
  description: string;
  author: string;
  techStack: string[];
  category: string;
  githubUrl: string;
  liveUrl?: string;
  internshipPeriod: string;
  projectType?: string;
  companyName?: string;
}

interface DashboardWrapperProps {
  userProjects: Project[];
  favoriteProjects: Project[];
  onSubmitProject: () => void;
}

const DashboardWrapper = ({ userProjects, favoriteProjects, onSubmitProject }: DashboardWrapperProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profileCompleteness = useAuthStore((state) => state.profileCompleteness);
  const fetchProfileCompleteness = useAuthStore((state) => state.fetchProfileCompleteness);

  // Fetch completeness on mount
  React.useEffect(() => {
    fetchProfileCompleteness();
  }, [fetchProfileCompleteness]);

  const handleSubmitProject = async () => {
    if (!profileCompleteness) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile information first. Your bio, skills, and education details are required for project submissions.",
        variant: "destructive"
      });
      return;
    }
    // Navigate back to home page and trigger project submission
    navigate("/");
    setTimeout(() => {
      onSubmitProject();
    }, 100);
  };

  return (
    <Dashboard
      userProjects={userProjects}
      favoriteProjects={favoriteProjects}
      onSubmitProject={handleSubmitProject}
    />
  );
};

export default DashboardWrapper;
