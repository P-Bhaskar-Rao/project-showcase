import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "@/api/axiosInstance";
import ProjectCard from "@/components/ProjectCard";
import Header from "@/components/Header";
import PaginationControls from "@/components/PaginationControls";
import { Project } from "../types/Project";
import { toast } from 'sonner';
import ProjectSubmissionModal from "@/components/ProjectSubmissionModal";
import AuthorModal from "@/components/AuthorModal";
import axiosInstance from "@/api/axiosInstance";

interface Engagement {
  _id: string;
  type: string;
  fromUser?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  toUser?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface SubmittedProject {
  id?: string;
  name: string;
  description: string;
  author: string;
  category: string;
  githubUrl: string;
  liveUrl?: string;
  projectType: string;
  companyName?: string;
  internshipStartDate?: string;
  internshipEndDate?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  architectureDiagram?: string;
  techStack: string[];
  authorId?: string;
  internshipPeriod?: string;
  repoVisibility?: string;
}

interface Author {
  _id: string;
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
  createdAt?: string;
  isVerified?: boolean;
}

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;
  const [stats, setStats] = useState({ myProjectsCount: 0, engagedWithCount: 0, engagedByCount: 0 });
  const [engagedWith, setEngagedWith] = useState<Engagement[]>([]);
  const [engagedBy, setEngagedBy] = useState<Engagement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  // Set the number of projects per page for the dashboard
  const PROJECTS_PER_PAGE = 3;
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [currentProjectSlide, setCurrentProjectSlide] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    // Fetch dashboard stats
    console.log('[Dashboard] Fetching /profile/dashboard-stats');
    axiosInstance.get("/profile/dashboard-stats").then(res => {
      console.log('[Dashboard] /profile/dashboard-stats response:', res.data);
      if (res.data.success) setStats(res.data.stats);
    });
    // Fetch users I engaged with
    axios.get("/profile/engagements/mine").then(res => {
      if (res.data.success) setEngagedWith(res.data.engagements);
    });
    // Fetch users who engaged with me
    axios.get("/profile/engagements/with-me").then(res => {
      if (res.data.success) setEngagedBy(res.data.engagements);
    });

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/projects/my-projects?page=${page}&limit=${PROJECTS_PER_PAGE}`);
        if (response.data && Array.isArray(response.data.projects)) {
          setProjects(response.data.projects.map((project: any) => ({
            id: project._id || project.id || '',
            name: project.name || '',
            description: project.description || '',
            author: project.author || '',
            authorId: project.authorId || '',
            techStack: project.techStack || [],
            category: project.category || '',
            githubUrl: project.githubUrl || '',
            liveUrl: project.liveUrl || '',
            internshipPeriod: project.internshipPeriod || '',
            image: project.image || '',
            architectureDiagram: project.architectureDiagram || '',
            projectType: project.projectType || '',
            companyName: project.companyName || '',
            likes: project.likes || [],
            engages: project.engages || [],
          })) as Project[]);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [API_URL, isLoggedIn, navigate, page]);

  // Handle author click to open AuthorModal
  const handleAuthorClick = async (authorId: string, authorName: string) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/profile/id/${authorId}`);
      if (res.data && res.data.user) {
        setSelectedAuthor(res.data.user);
        setIsAuthorModalOpen(true);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch author data:', error);
      toast.error("Failed to load author information.");
    }
  };

  // Handle project click to navigate to project page
  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // Handle project submission
  const handleProjectSubmission = async (submittedProject: SubmittedProject) => {
    try {
      // Actually submit the project to the backend
      await axiosInstance.post('/projects', submittedProject);

      setIsSubmissionModalOpen(false);

      // Refresh the projects list
      const response = await axiosInstance.get(`/projects/my-projects?page=${page}&limit=${PROJECTS_PER_PAGE}`);
      if (response.data && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects.map((projectData: {
          _id?: string;
          id?: string;
          name?: string;
          description?: string;
          author?: string;
          authorId?: string;
          techStack?: string[];
          category?: string;
          githubUrl?: string;
          liveUrl?: string;
          internshipPeriod?: string;
          image?: string;
          architectureDiagram?: string;
          projectType?: string;
          companyName?: string;
          likes?: string[];
          engages?: { type: string; userId: string }[];
        }) => ({
          id: projectData._id || projectData.id || '',
          name: projectData.name || '',
          description: projectData.description || '',
          author: projectData.author || '',
          authorId: projectData.authorId || '',
          techStack: projectData.techStack || [],
          category: projectData.category || '',
          githubUrl: projectData.githubUrl || '',
          liveUrl: projectData.liveUrl || '',
          internshipPeriod: projectData.internshipPeriod || '',
          image: projectData.image || '',
          architectureDiagram: projectData.architectureDiagram || '',
          projectType: projectData.projectType || '',
          companyName: projectData.companyName || '',
          likes: projectData.likes || [],
          engages: projectData.engages || [],
        })) as Project[]);
        setTotalPages(response.data.totalPages || 1);
      }

      toast.success("Project submitted successfully!");
    } catch (error) {
      console.error('Failed to submit project:', error);
      toast.error("Failed to submit project. Please try again.");
    }
  };

  // Carousel navigation functions
  const nextProjectSlide = () => {
    const cardsPerSlide = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const maxSlides = Math.ceil(projects.length / cardsPerSlide);
    setCurrentProjectSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevProjectSlide = () => {
    const cardsPerSlide = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const maxSlides = Math.ceil(projects.length / cardsPerSlide);
    setCurrentProjectSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToProjectSlide = (slideIndex: number) => {
    setCurrentProjectSlide(slideIndex);
  };

  // Dummy handlers for ProjectGrid
  const handleGithubClick = () => {};
  const handleLiveDemoClick = () => {};
  const handleArchitectureClick = () => {};

  // Use the same filter logic as Projects page
  // Use projects directly since we're not filtering in dashboard
  const filteredProjects = projects;

  // Reset carousel when filtered projects change
  useEffect(() => {
    setCurrentProjectSlide(0);
  }, [filteredProjects]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (filteredProjects.length <= 3) return; // Only enable if there are more than 3 projects
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevProjectSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextProjectSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredProjects.length]);

  const techOptions = useMemo(
    () => Array.from(new Set(projects.flatMap(p => p.techStack))).sort(),
    [projects]
  );



  // Project Carousel Component
  const ProjectCarousel = ({ projects }: { projects: Project[] }) => {
    // Responsive cards per slide: 1 on small, 2 on medium, 3 on large
    const getCardsPerSlide = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) return 3; // lg
        if (window.innerWidth >= 640) return 2;  // sm
        return 1; // xs
      }
      return 3; // default
    };

    const [cardsPerSlide, setCardsPerSlide] = useState(getCardsPerSlide());

    // Reset carousel to first slide when projects change (i.e., page changes)
    useEffect(() => {
      setCurrentProjectSlide(0);
    }, [projects]);

    useEffect(() => {
      const handleResize = () => {
        setCardsPerSlide(getCardsPerSlide());
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Only use the current page's projects for slides
    const maxSlides = Math.max(1, Math.ceil(projects.length / cardsPerSlide));

    useEffect(() => {
      if (currentProjectSlide >= maxSlides) {
        setCurrentProjectSlide(0);
      }
    }, [maxSlides]);

    if (projects.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet</p>
          <button
            onClick={() => setIsSubmissionModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Submit your first project
          </button>
        </div>
      );
    }

    // Hide arrows/indicators if only one slide
    const showNavigation = maxSlides > 1;

    return (
      <div className="relative overflow-hidden min-h-[340px]">
        {showNavigation && (
          <>
            <button
              onClick={prevProjectSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous projects"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextProjectSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next projects"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${maxSlides * 100}%`,
              transform: `translateX(-${currentProjectSlide * 100}%)`,
            }}
          >
            {Array.from({ length: maxSlides }, (_, slideIndex) => {
              const startIndex = slideIndex * cardsPerSlide;
              const endIndex = Math.min(startIndex + cardsPerSlide, projects.length);
              const slideProjects = projects.slice(startIndex, endIndex);
              return (
                <div
                  key={slideIndex}
                  className="flex gap-4 sm:gap-6 w-full"
                  style={{ width: '100%' }}
                >
                  {slideProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex-1 min-w-0 flex-shrink-0"
                    >
                      <ProjectCard
                        project={project}
                        isLoggedIn={isLoggedIn}
                        isFavorite={false}
                        onToggleFavorite={() => {}}
                        onAuthorClick={handleAuthorClick}
                        onGithubClick={handleGithubClick}
                        onLiveDemoClick={handleLiveDemoClick}
                        onArchitectureClick={handleArchitectureClick}
                        onRequireLogin={() => {
                          toast.error("Authentication Required: Please log in to perform this action.");
                        }}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        {showNavigation && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => goToProjectSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentProjectSlide
                    ? 'bg-emerald-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        {showNavigation && (
          <div className="text-center mt-4 text-sm text-gray-500">
            {currentProjectSlide + 1} of {maxSlides}
          </div>
        )}
      </div>
    );
  };

  // Engagement Card Component
  const EngagementCard = ({ engagement, isEngagedBy }: { engagement: Engagement; isEngagedBy: boolean }) => {
    const user = isEngagedBy ? engagement.fromUser : engagement.toUser;
    const getUserInitial = (name: string | null | undefined) => {
      return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const [imageError, setImageError] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start gap-3">
          {user?.avatar && !imageError ? (
            <img 
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-100">
              {getUserInitial(user?.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => user?._id && handleAuthorClick(user._id, user.name)}
                className="font-semibold text-gray-900 truncate hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                title={`View ${user?.name || 'User'}'s profile`}
              >
                {user?.name || 'Unknown User'}
              </button>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 shrink-0">
                {engagement.type}
              </span>
            </div>
            <button
              onClick={() => engagement.project?._id && handleProjectClick(engagement.project._id)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline block mb-2 truncate cursor-pointer transition-colors"
              title={`View ${engagement.project?.name || 'Project'}`}
            >
              {engagement.project?.name || 'Unknown Project'}
            </button>
            <p className="text-xs text-gray-500">
              {new Date(engagement.createdAt).toLocaleDateString()}
            </p>
                    </div>
                  </div>
                </div>
    );
  };

  // Engagement Table Component
  const EngagementTable = ({ engagements, isEngagedBy }: { engagements: Engagement[]; isEngagedBy: boolean }) => {
    const getUserInitial = (name: string | null | undefined) => {
      return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {engagements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                    {isEngagedBy ? 'No users have engaged with you yet.' : 'You haven\'t engaged with any users yet.'}
                  </td>
                </tr>
              ) : (
                engagements.map((engagement) => {
                  const user = isEngagedBy ? engagement.fromUser : engagement.toUser;
                  return (
                    <tr key={engagement._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AvatarWithFallback 
                            user={user}
                            size="sm"
                            className="mr-3"
                          />
                          <button
                            onClick={() => user?._id && handleAuthorClick(user._id, user.name)}
                            className="text-sm font-medium text-gray-900 hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                            title={`View ${user?.name || 'User'}'s profile`}
                          >
                            {user?.name || 'Unknown User'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {engagement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => engagement.project?._id && handleProjectClick(engagement.project._id)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          title={`View ${engagement.project?.name || 'Project'}`}
                        >
                          {engagement.project?.name || 'Unknown Project'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(engagement.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
    );
  };

  // Avatar with fallback component
  const AvatarWithFallback = ({ 
    user, 
    size = "md", 
    className = "" 
  }: { 
    user?: { name?: string; avatar?: string } | null; 
    size?: "sm" | "md" | "lg"; 
    className?: string;
  }) => {
    const [imageError, setImageError] = useState(false);
    const getUserInitial = (name: string | null | undefined) => {
      return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const sizeClasses = {
      sm: "w-10 h-10 text-sm",
      md: "w-12 h-12 text-sm", 
      lg: "w-16 h-16 text-xl"
    };

    return (
      <>
        {user?.avatar && !imageError ? (
          <img 
            src={user.avatar}
            alt={user.name || 'User'}
            className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
            {getUserInitial(user?.name)}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} onAuthModalOpen={() => {}} onSubmitProject={() => setIsSubmissionModalOpen(true)} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Here's an overview of your project portfolio and engagement activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">My Projects</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.myProjectsCount}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Users I Engaged</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.engagedWithCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Users Engaged Me</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.engagedByCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Projects</h2>
            <button
              onClick={() => setIsSubmissionModalOpen(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Project
            </button>
          </div>

          {/* Responsive Project Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(PROJECTS_PER_PAGE)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <button
                onClick={() => setIsSubmissionModalOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Submit your first project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isLoggedIn={isLoggedIn}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                  onAuthorClick={handleAuthorClick}
                  onGithubClick={handleGithubClick}
                  onLiveDemoClick={handleLiveDemoClick}
                  onArchitectureClick={handleArchitectureClick}
                  onRequireLogin={() => {
                    toast.error("Authentication Required: Please log in to perform this action.");
                  }}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Engagement Sections */}
        <div className="space-y-8 sm:space-y-10">
          
          {/* Users Who Engaged With Me */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Users Who Engaged With Me</h2>
            
            <div className="block md:hidden">
              {engagedBy.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  No users have engaged with you yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {engagedBy.map((engagement) => (
                    <EngagementCard key={engagement._id} engagement={engagement} isEngagedBy={true} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="hidden md:block">
              <EngagementTable engagements={engagedBy} isEngagedBy={true} />
            </div>
          </div>

          {/* Users I Engaged With */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Users I Engaged With</h2>
            
            <div className="block md:hidden">
                {engagedWith.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  You haven't engaged with any users yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {engagedWith.map((engagement) => (
                    <EngagementCard key={engagement._id} engagement={engagement} isEngagedBy={false} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="hidden md:block">
              <EngagementTable engagements={engagedWith} isEngagedBy={false} />
            </div>
          </div>
        </div>
      </div> {/* End main content container */}

      {/* Footer (copied from Home page) */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              A Platform to showcase the incredible work of our intern community
            </p>
          </div>
        </div>
      </footer>
      
      <ProjectSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleProjectSubmission}
      />
      
      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        author={selectedAuthor}
      />
    </div>
  );
};

export default Dashboard; 