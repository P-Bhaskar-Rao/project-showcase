import { useState, useMemo, useEffect } from "react"; // Import useEffect
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import AuthorModal from "@/components/AuthorModal";
import ProjectSubmissionModal from "@/components/ProjectSubmissionModal";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProjectGrid from "@/components/ProjectGrid";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/useAuthStore"; // Import your Zustand store
import axiosInstance from "@/api/axiosInstance";

interface Project {
  id: string;
  name: string;
  description: string;
  author: string;
  authorId: string;
  techStack: string[];
  category: string;
  githubUrl: string;
  liveUrl?: string;
  internshipPeriod: string;
  image?: string;
  architectureDiagram?: string;
}

interface Author {
  name: string;
  email: string;
  college: string;
  location: string;
  joinDate: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
}

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const profileCompleteness = useAuthStore((state) => state.profileCompleteness);
  const fetchProfileCompleteness = useAuthStore((state) => state.fetchProfileCompleteness);
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileCompleteness();
    }
  }, [user, fetchProfileCompleteness]);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    // Fetch projects from backend on mount
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/projects`);
        if (response.data && Array.isArray(response.data.projects)) {
          // Map _id to id and authorId for frontend compatibility
          const mappedProjects = response.data.projects.map((project: any) => ({
            ...project,
            id: project._id || project.id, // Always ensure id is present and unique
            authorId: project.authorId || '',
          }));
          setProjects(mappedProjects);
        }
      } catch (error) {
        // Optionally show a toast or log error
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, [API_URL]);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    filteredProjects
  } = useProjectFilters(projects);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const { favorites, toggleFavorite } = useFavorites(isLoggedIn, openAuthModal);

  const techOptions = useMemo(() => 
    Array.from(new Set(projects.flatMap(p => p.techStack))).sort(), 
    [projects]
  );

  const openAuthorModal = async (authorId: string, authorName: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view author profiles.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    try {
      const res = await axiosInstance.get(`${API_URL}/profile/id/${authorId}`);
      if (res.data && res.data.user) {
        setSelectedAuthor(res.data.user);
        setIsAuthorModalOpen(true);
        return;
      }
    } catch (e) {
      // If not found in DB, fall back to generated author
    }
    toast({
      title: "Author Not Found",
      description: "Author information is not available.",
      variant: "destructive",
    });
  };

  const handleGithubClick = (e: React.MouseEvent, githubUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view project code.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleLiveDemoClick = (e: React.MouseEvent, liveUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view live demos.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleArchitectureClick = (e: React.MouseEvent, architectureUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view architecture diagrams.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleSubmitProject = () => {
    setIsSubmissionModalOpen(true);
  };

  // Helper to refresh token
  const refreshAccessToken = async () => {
    try {
      const res = await axiosInstance.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      if (res.data && res.data.accessToken) {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      }
    } catch (e) {
      // Refresh failed
    }
    return null;
  };

  const handleProjectSubmission = async (newProject: Project) => {
    
    let triedRefresh = false;
    let tokenToUse = accessToken;
    while (true) {
      try {
        const response = await axiosInstance.post(
          `${API_URL}/projects`,
          newProject,
          {
            headers: {
              Authorization: `Bearer ${tokenToUse}`,
            },
            withCredentials: true,
          }
        );
        setProjects(prev => [
          {
            ...response.data.project,
            id: response.data.project._id || response.data.project.id, // Always ensure id is present and unique
            authorId: response.data.project.authorId || '',
          },
          ...prev
        ]);
        setIsSubmissionModalOpen(false);
        toast({
          title: "Project Submitted!",
          description: "Your project has been successfully submitted and is now visible.",
        });
        break;
      } catch (error: any) {
        console.error('[DEBUG] Project submission error:', error?.response?.data || error);
        if (!triedRefresh && error.response?.data?.code === 'TOKEN_EXPIRED') {
          const newToken = await refreshAccessToken();
          if (newToken) {
            tokenToUse = newToken;
            triedRefresh = true;
            continue;
          } else {
            toast({
              title: "Session Expired",
              description: "Please log in again to submit your project.",
              variant: "destructive",
            });
            setIsAuthModalOpen(true);
            break;
          }
        }
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your project. Please try again.",
          variant: "destructive",
        });
        break;
      }
    }
  };

  const handleEditProfile = () => {
    setIsProfileCompletionModalOpen(false);
    window.location.href = '/dashboard';
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsSubmissionModalOpen(true);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      const response = await axiosInstance.patch(
        `${API_URL}/projects/${updatedProject.id}`,
        updatedProject,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? {
        ...response.data.project,
        id: response.data.project._id || response.data.project.id,
        authorId: response.data.project.authorId || '',
      } : p));
      setEditingProject(null);
      setIsSubmissionModalOpen(false);
      toast({ title: 'Project Updated!', description: 'Your project has been updated.' });
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Could not update project.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        isLoggedIn={isLoggedIn}
        onAuthModalOpen={openAuthModal}
        onSubmitProject={handleSubmitProject}
      />

      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${projects.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {projects.length > 0 && (
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedTech={selectedTech}
            setSelectedTech={setSelectedTech}
            sortBy={sortBy}
            setSortBy={setSortBy}
            techOptions={techOptions}
            totalProjects={projects.length}
            filteredCount={filteredProjects.length}
          />
        )}

        <ProjectGrid
          projects={filteredProjects}
          isLoggedIn={isLoggedIn}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onAuthorClick={(authorId, authorName) => { void openAuthorModal(authorId, authorName); }}
          onGithubClick={handleGithubClick}
          onLiveDemoClick={handleLiveDemoClick}
          onArchitectureClick={handleArchitectureClick}
          showSearchNoResults={projects.length > 0 && filteredProjects.length === 0}
          onSubmitProject={handleSubmitProject}
          onEditProject={handleEditProject}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              A Platform to showcase the incredible work of our intern community
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={() => setIsLoggedIn(true)}
      />
      
      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        author={selectedAuthor}
      />

      <ProjectSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => { setIsSubmissionModalOpen(false); setEditingProject(null); }}
        onSubmit={handleProjectSubmission}
        initialData={editingProject}
        onUpdate={handleUpdateProject}
      />

      <ProfileCompletionModal
        isOpen={isProfileCompletionModalOpen}
        onClose={() => setIsProfileCompletionModalOpen(false)}
        onEditProfile={handleEditProfile}
      />
    </div>
  );
};

export default Index;
