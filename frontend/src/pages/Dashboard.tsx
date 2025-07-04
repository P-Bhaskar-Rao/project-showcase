
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Edit,
  Save,
  X,
  Phone, 
  MapPin, 
  Github, 
  Linkedin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuickStats from "@/components/dashboard/QuickStats";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";
import ProfilePictureSection from "@/components/dashboard/ProfilePictureSection";
import SkillsSection from "@/components/dashboard/SkillsSection";
import EducationSection from "@/components/dashboard/EducationSection";
import ProjectsSection from "@/components/dashboard/ProjectsSection";

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

const Dashboard = ({ userProjects, favoriteProjects, onSubmitProject }: DashboardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Passionate full-stack developer with experience in React, Node.js, and modern web technologies. Love building innovative solutions that make a difference.",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    githubUrl: "https://github.com/johndoe",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        year: "2024"
      }
    ],
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker"]
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });

  const isProfileComplete = userProfile.name && userProfile.bio && userProfile.githubUrl;

  const handleSaveProfile = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
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
          joinDate={userProfile.joinDate}
          isProfileComplete={!!isProfileComplete}
        />

        <div className="space-y-6">
          {/* Profile completion notice */}
          {!isProfileComplete && (
            <ProfileCompletionBanner onEditProfile={() => setIsEditing(true)} />
          )}

          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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
                profile={userProfile}
                editedProfile={editedProfile}
                setEditedProfile={setEditedProfile}
                isEditing={isEditing}
              />

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700 mt-1 text-sm sm:text-base">{userProfile.bio}</p>
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
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-sm sm:text-base">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="break-all">{userProfile.phone}</span>
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
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-sm sm:text-base">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{userProfile.location}</span>
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
                        value={editedProfile.githubUrl}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Github className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a 
                        href={userProfile.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base"
                      >
                        {userProfile.githubUrl}
                      </a>
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
                        value={editedProfile.linkedinUrl}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Linkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a 
                        href={userProfile.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all text-sm sm:text-base"
                      >
                        {userProfile.linkedinUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Section */}
          <EducationSection
            education={userProfile.education}
            editedEducation={editedProfile.education}
            isEditing={isEditing}
            newEducation={newEducation}
            setNewEducation={setNewEducation}
            onAddEducation={addEducation}
            onRemoveEducation={removeEducation}
          />

          {/* Skills Section */}
          <SkillsSection
            skills={userProfile.skills}
            editedSkills={editedProfile.skills}
            setEditedSkills={(skills) => setEditedProfile(prev => ({ ...prev, skills }))}
            isEditing={isEditing}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
          />
        </div>

        {/* Projects Sections */}
        <div className="mt-8">
          <ProjectsSection
            userProjects={userProjects}
            favoriteProjects={favoriteProjects}
            onSubmitProject={onSubmitProject}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
