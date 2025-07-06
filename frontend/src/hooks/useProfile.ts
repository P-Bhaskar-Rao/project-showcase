import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL;

interface ProfileData {
  bio?: string;
  skills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  avatar?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
}

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness>({
    isComplete: false,
    missingFields: []
  });
  
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  // Get auth token from localStorage or wherever you store it
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Check profile completeness
  const checkProfileCompleteness = async (): Promise<ProfileCompleteness> => {
    if (!user) {
      return { isComplete: false, missingFields: [] };
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return { isComplete: false, missingFields: [] };
      }

      const response = await axiosInstance.get(`${API_URL}/profile/completeness`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { isProfileComplete, missingFields } = response.data;
      
      setProfileCompleteness({
        isComplete: isProfileComplete,
        missingFields: missingFields || []
      });

      return {
        isComplete: isProfileComplete,
        missingFields: missingFields || []
      };
    } catch (error: any) {
      console.error('Error checking profile completeness:', error);
      toast({
        title: "Error",
        description: "Failed to check profile completeness.",
        variant: "destructive",
      });
      return { isComplete: false, missingFields: [] };
    }
  };

  // Get user profile
  const getProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await axiosInstance.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(response.data.user);
      setProfileCompleteness({
        isComplete: response.data.isProfileComplete,
        missingFields: []
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: ProfileData) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) return false;

      const response = await axiosInstance.put(`${API_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setProfile(response.data.user);
      setProfileCompleteness({
        isComplete: response.data.isProfileComplete,
        missingFields: []
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || "Failed to update profile.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if profile is complete (for project submission)
  const isProfileCompleteForSubmission = async (): Promise<boolean> => {
    const completeness = await checkProfileCompleteness();
    return completeness.isComplete;
  };

  // Get missing fields for profile completion
  const getMissingFields = (): string[] => {
    return profileCompleteness.missingFields;
  };

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      getProfile();
    } else {
      setProfile(null);
      setProfileCompleteness({ isComplete: false, missingFields: [] });
    }
  }, [user]);

  return {
    profile,
    isLoading,
    profileCompleteness,
    checkProfileCompleteness,
    getProfile,
    updateProfile,
    isProfileCompleteForSubmission,
    getMissingFields
  };
}; 