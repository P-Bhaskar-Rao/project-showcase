
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmitProject = () => {
    // Check if user has basic profile information
    const hasBasicProfile = true; // This would normally check user profile completeness
    
    if (!hasBasicProfile) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile information first. Your name, bio, and GitHub profile are required for project submissions.",
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
