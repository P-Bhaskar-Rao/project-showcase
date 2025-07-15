import { useState, useMemo, useEffect } from "react";
import { toast } from 'sonner';
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
import PaginationControls from "@/components/PaginationControls";
import { Project } from "../types/Project";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const PROJECTS_PER_PAGE = 6;

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(isLoggedIn && isInitialized, openAuthModal) as { favorites: Set<string>, toggleFavorite: (id: string) => void, loading: boolean };

  useEffect(() => {
    if (user) {
      fetchProfileCompleteness();
    }
  }, [user, fetchProfileCompleteness]);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    // Fetch projects from backend on mount or page change
    const fetchProjects = async () => {
      setLoading(true);
      try {
        type BackendProject = Omit<Project, 'id'> & { _id?: string, id?: string, authorId?: string };
        const response = await axiosInstance.get(`${API_URL}/projects?page=${page}&limit=${PROJECTS_PER_PAGE}`);
        if (response.data && Array.isArray(response.data.projects)) {
          const mappedProjects: Project[] = response.data.projects.map((project: BackendProject): Project => ({
            ...project,
            id: project._id || project.id || '',
            authorId: project.authorId || '',
          }));
          setProjects(mappedProjects);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [API_URL, page]);

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const {
    searchTerm,
    setSearchTerm,
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    filteredProjects
  } = useProjectFilters(projects, selectedCategory);

  const techOptions = useMemo(() => 
    Array.from(new Set(projects.flatMap(p => p.techStack))).sort(), 
    [projects]
  );

  const openAuthorModal = async (authorId: string, authorName: string) => {
    if (!isLoggedIn) {
      toast.error("Authentication Required: Please sign in to view author profiles.");
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
    toast.error("Author Not Found: Author information is not available.");
  };

  const handleGithubClick = (e: React.MouseEvent, githubUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Authentication Required: Please sign in to view project code.");
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleLiveDemoClick = (e: React.MouseEvent, liveUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Authentication Required: Please sign in to view live demos.");
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleArchitectureClick = (e: React.MouseEvent, architectureUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Authentication Required: Please sign in to view architecture diagrams.");
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
        toast.success("Project Submitted!", {
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
            toast.error("Session Expired", {
              description: "Please log in again to submit your project.",
            });
            setIsAuthModalOpen(true);
            break;
          }
        }
        toast.error("Submission Failed", {
          description: "There was an error submitting your project. Please try again.",
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
      toast.success('Project Updated!', {
        description: 'Your project has been updated.',
      });
    } catch (error) {
      toast.error('Update Failed', {
        description: 'Could not update project.',
      });
    }
  };

  const handleDeleteProject = (project: Project) => {
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
      toast.success("Project Deleted", {
        description: "Your project has been deleted.",
      });
    } catch (error) {
      toast.error("Delete Failed", {
        description: "Could not delete project.",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  // Only sort and render when favorites are loaded
  let sortedProjects: Project[] = [];
  if (!favoritesLoading) {
    sortedProjects = [...filteredProjects].sort((a, b) => {
      const aFav = favorites.has(a.id.toString());
      const bFav = favorites.has(b.id.toString());
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  }


  const isFiltered =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedTech !== "All";
  const filteredTotalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        isLoggedIn={isLoggedIn}
        onAuthModalOpen={openAuthModal}
        onSubmitProject={handleSubmitProject}
      />
      <main className="flex-1 w-full max-w-full px-4 mx-auto sm:max-w-3xl md:max-w-5xl lg:max-w-7xl">
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
          onAuthorClick={openAuthorModal}
          onGithubClick={handleGithubClick}
          onLiveDemoClick={handleLiveDemoClick}
          onArchitectureClick={handleArchitectureClick}
          onRequireLogin={() => openAuthModal('login')}
          onSubmitProject={handleSubmitProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          showSearchNoResults={projects.length > 0 && filteredProjects.length === 0}
          loading={loading}
        />
        {isFiltered
          ? filteredTotalPages > 1 && (
              <PaginationControls page={page} totalPages={filteredTotalPages} onPageChange={setPage} />
            )
          : totalPages > 1 && (
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
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