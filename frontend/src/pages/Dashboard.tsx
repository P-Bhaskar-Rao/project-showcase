import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  Edit,
  Save,
  X,
  Phone, 
  MapPin, 
  Github, 
  Linkedin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore, User } from "@/store/useAuthStore";
import QuickStats from "@/components/dashboard/QuickStats";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";
import ProfilePictureSection from "@/components/dashboard/ProfilePictureSection";
import SkillsSection from "@/components/dashboard/SkillsSection";
import EducationSection from "@/components/dashboard/EducationSection";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import { format } from 'date-fns';
import { useFavorites } from "@/hooks/useFavorites";

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

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
  joinDate: string;
  githubUrl: string;
  linkedinUrl: string;
  profilePicture?: string;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
}

interface DashboardProps {
  userProjects: Project[];
  favoriteProjects: Project[];
  onSubmitProject: () => void;
}

export interface Profile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  joinDate?: string;
  phone?: string;
  location?: string;
  // Add any other fields as needed
}

const Dashboard = ({ userProjects, favoriteProjects, onSubmitProject }: DashboardProps) => {
  const { toast } = useToast();
  const profile = useAuthStore((state) => state.profile);
  console.log('profile:',profile)
  const user = useAuthStore((state) => state.user);
  console.log('user:',user)
  const profileCompleteness = useAuthStore((state) => state.profileCompleteness);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [isEditing, setIsEditing] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(!!user, () => {});

  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });

  useEffect(() => {
    if (isInitialized && user && accessToken) {
      fetchProfile();
    }
  }, [fetchProfile, isInitialized, user, accessToken]);

  // Update profile data when API data is available
  useEffect(() => {
    if (profile || user) {
      const apiProfile: UserProfile = {
        name: profile?.name || user?.name || "",
        email: profile?.email || user?.email || "",
        bio: profile?.bio || "",
        phone: (profile as Profile & { phone?: string })?.phone || "",
        location: (profile as Profile & { location?: string })?.location || "",
        joinDate: profile?.joinDate || (user as User & { createdAt?: string })?.createdAt || "",
        githubUrl: profile?.socialLinks?.github || "",
        linkedinUrl: profile?.socialLinks?.linkedin || "",
        profilePicture: profile?.avatar || "",
        education: profile?.education?.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.endYear?.toString() || ""
        })) || [],
        skills: profile?.skills || []
      };
      setUserProfile(apiProfile);
      setEditedProfile(apiProfile);
    } else {
      setUserProfile(null);
      setEditedProfile(null);
    }
  }, [profile, user]);

  const isProfileComplete = profileCompleteness;

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    console.log("Save clicked", editedProfile);
    try {
      const profileData = {
        bio: editedProfile.bio,
        skills: editedProfile.skills,
        education: editedProfile.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.degree, // Using degree as fieldOfStudy for now
          startYear: parseInt(edu.year) || new Date().getFullYear(),
          endYear: parseInt(edu.year) || new Date().getFullYear()
        })),
        socialLinks: {
          github: editedProfile.githubUrl,
          linkedin: editedProfile.linkedinUrl
        }
      };
      console.log("Profile data to send:", profileData);
      const success = await updateProfile(profileData);
      console.log("API call success:", success);
      if (success) {
        setUserProfile(editedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedProfile?.skills.includes(newSkill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.year) {
      setEditedProfile(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
      setNewEducation({ degree: "", institution: "", year: "" });
    }
  };

  const removeEducation = (index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const formattedJoinDate = userProfile?.joinDate
    ? `Joined ${format(new Date(userProfile.joinDate), 'MMMM yyyy')}`
    : "No join date yet";

  if (!isInitialized || !user || !accessToken || favoritesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your profile and track your projects</p>
        </div>

        {/* Quick Stats */}
        <QuickStats
          userProjectsCount={userProjects.length}
          favoriteProjectsCount={favoriteProjects.length}
          joinDate={formattedJoinDate}
          isProfileComplete={!!isProfileComplete}
        />

        <div className="space-y-6">
          {/* Profile completion notice */}
          {!isProfileComplete && (
            <ProfileCompletionBanner onEditProfile={() => {
              setEditedProfile(userProfile);
              setIsEditing(true);
            }} />
          )}

          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => {
                  setEditedProfile(userProfile);
                  setIsEditing(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <ProfilePictureSection
                profile={userProfile || { name: "No name yet", email: "No email yet", bio: "No bio yet", phone: "No phone yet", location: "No location yet", joinDate: "No join date yet", githubUrl: "No GitHub URL", linkedinUrl: "No LinkedIn URL", education: [], skills: [] }}
                editedProfile={editedProfile || { name: "No name yet", email: "No email yet", bio: "No bio yet", phone: "No phone yet", location: "No location yet", joinDate: "No join date yet", githubUrl: "No GitHub URL", linkedinUrl: "No LinkedIn URL", education: [], skills: [] }}
                setEditedProfile={setEditedProfile}
                isEditing={isEditing}
              />

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile?.bio ?? ""}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1"
                    rows={3}
                    placeholder="No bio yet"
                  />
                ) : (
                  <p className="text-gray-700 mt-1 text-sm sm:text-base">{userProfile?.bio || "No bio yet"}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        id="phone"
                        value={editedProfile?.phone ?? ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="No phone yet"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-sm sm:text-base">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="break-all">{userProfile?.phone || "No phone yet"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        id="location"
                        value={editedProfile?.location ?? ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="No location yet"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-sm sm:text-base">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{userProfile?.location || "No location yet"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github">GitHub Profile</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Github className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        id="github"
                        value={editedProfile?.githubUrl ?? ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="No GitHub URL yet"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Github className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {userProfile?.githubUrl ? (
                        <a 
                          href={userProfile.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base"
                        >
                          {userProfile.githubUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400">No GitHub URL yet</span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Linkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <Input
                        id="linkedin"
                        value={editedProfile?.linkedinUrl ?? ""}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="No LinkedIn URL yet"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Linkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      {userProfile?.linkedinUrl ? (
                        <a 
                          href={userProfile.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base"
                        >
                          {userProfile.linkedinUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400">No LinkedIn URL yet</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Section */}
          <EducationSection
            education={userProfile?.education || []}
            editedEducation={editedProfile?.education || []}
            isEditing={isEditing}
            newEducation={newEducation}
            setNewEducation={setNewEducation}
            onAddEducation={addEducation}
            onRemoveEducation={removeEducation}
          />
          {(userProfile?.education && userProfile.education.length > 0) && (
            <div className="text-gray-400 px-4 pb-4">No education added yet</div>
          )}

          {/* Skills Section */}
          <SkillsSection
            skills={userProfile?.skills || []}
            editedSkills={editedProfile?.skills || []}
            setEditedSkills={(skills) => setEditedProfile(prev => ({ ...prev, skills }))}
            isEditing={isEditing}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
          />
          {(userProfile?.skills && userProfile.skills.length > 0) && (
            <div className="text-gray-400 px-4 pb-4">No skills added yet</div>
          )}
        </div>

        {/* Projects Sections */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 mb-8 md:mb-0">
            <ProjectsSection
              userProjects={userProjects}
              favoriteProjects={favoriteProjects}
              onSubmitProject={onSubmitProject}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
