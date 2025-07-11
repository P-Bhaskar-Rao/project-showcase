import { useState, useMemo, useEffect } from "react";
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
import { useAuthStore } from "@/store/useAuthStore";
import axiosInstance from "@/api/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProjectType {
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

const Projects = () => {
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
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(isLoggedIn && isInitialized, openAuthModal);

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
        type BackendProject = Omit<ProjectType, 'id'> & { _id?: string, id?: string, authorId?: string };
        const response = await axiosInstance.get(`${API_URL}/projects`);
        if (response.data && Array.isArray(response.data.projects)) {
          // Map _id to id and authorId for frontend compatibility
          const mappedProjects: ProjectType[] = response.data.projects.map((project: BackendProject): ProjectType => ({
            ...project,
            id: project._id || project.id || '', // Always ensure id is present and unique
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
        // Use setAuth to update accessToken in store
        if (user) setAuth(user, res.data.accessToken);
        return res.data.accessToken;
      }
    } catch (e) {
      // Refresh failed
    }
    return null;
  };

  const handleProjectSubmission = async (newProject: ProjectType) => {
    console.log('[DEBUG] Submitting project payload:', newProject);
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
      } catch (error) {
        const err = error as { response?: { data?: { code?: string } } };
        console.error('[DEBUG] Project submission error:', err?.response?.data || err);
        if (!triedRefresh && err?.response?.data?.code === 'TOKEN_EXPIRED') {
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

  const handleEditProject = (project: ProjectType) => {
    setEditingProject(project);
    setIsSubmissionModalOpen(true);
  };

  const handleUpdateProject = async (updatedProject: ProjectType) => {
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

  const handleDeleteProject = (project: ProjectType) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await axiosInstance.delete(`${API_URL}/projects/${projectToDelete.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Project Deleted", description: "Your project has been deleted.", variant: "destructive" });
    } catch (error) {
      toast({ title: "Delete Failed", description: "Could not delete project.", variant: "destructive" });
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  // Only sort and render when favorites are loaded
  let sortedProjects: ProjectType[] = [];
  if (!favoritesLoading) {
    sortedProjects = [...filteredProjects].sort((a, b) => {
      const aFav = favorites.has(a.id.toString());
      const bFav = favorites.has(b.id.toString());
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  }
  console.log('[DEBUG] favorites:', Array.from(favorites));
  console.log('[DEBUG] sortedProjects:', sortedProjects.map(p => ({ id: p.id, name: p.name })));

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

        {favoritesLoading ? (
          <div className="py-12 text-center text-gray-500">Loading projects...</div>
        ) : (
          <ProjectGrid
            projects={sortedProjects}
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
            onDeleteProject={handleDeleteProject}
          />
        )}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project?</DialogTitle>
          </DialogHeader>
          <div className="text-red-500 font-semibold mb-4">
            Are you sure you want to delete <span className="font-bold">{projectToDelete?.name}</span>?<br />
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects; 