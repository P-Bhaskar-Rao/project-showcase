import { Github, ExternalLink, Calendar, User, Heart, Lock, FileText, Pencil, Trash, Briefcase, Building2, Star, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { Project } from "../types/Project";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import axios from "axios";

interface ProjectCardProps {
  project: Project;
  isLoggedIn: boolean;
  isFavorite: boolean;
  onToggleFavorite: (projectId: string) => void;
  onAuthorClick: (authorId: string, authorName: string) => void;
  onGithubClick: (e: React.MouseEvent, githubUrl: string) => void;
  onLiveDemoClick: (e: React.MouseEvent, liveUrl: string) => void;
  onArchitectureClick: (e: React.MouseEvent, architectureUrl: string) => void;
  onRequireLogin?: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const ProjectCard = ({
  project,
  isLoggedIn,
  isFavorite,
  onToggleFavorite,
  onAuthorClick,
  onGithubClick,
  onLiveDemoClick,
  onArchitectureClick,
  onRequireLogin,
  onEdit,
  onDelete
}: ProjectCardProps) => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const [likes, setLikes] = useState(project.likes ? project.likes.length : 0);
  const [liked, setLiked] = useState(project.likes ? project.likes.includes(user?.id) : false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [engageCounts, setEngageCounts] = useState<{ [type: string]: number }>({});
  const [totalEngages, setTotalEngages] = useState(0);
  const [engageLoading, setEngageLoading] = useState(false);
  const engageTypes = [
    { label: 'Internship', value: 'internship' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Full-time', value: 'full-time' },
    { label: 'Contract', value: 'contract' },
  ];

  useEffect(() => {
    // Fetch engagement counts
    const fetchEngagements = async () => {
      try {
        const res = await axiosInstance.get(`/profile/project/${project.id}/engagement-counts`);
        if (res.data && res.data.success) {
          setEngageCounts(res.data.engagements || {});
          setTotalEngages(res.data.total || 0);
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchEngagements();
  }, [project.id]);

  const isOwner = user && user.id === project.authorId;

  const getTechColor = (tech: string) => {
    const colors = {
      "React": "bg-blue-100 text-blue-800",
      "Node.js": "bg-green-100 text-green-800",
      "Python": "bg-yellow-100 text-yellow-800",
      "MongoDB": "bg-green-100 text-green-800",
      "TypeScript": "bg-blue-100 text-blue-800",
      "Vue.js": "bg-emerald-100 text-emerald-800",
      "Firebase": "bg-orange-100 text-orange-800",
      "PostgreSQL": "bg-indigo-100 text-indigo-800",
      "TensorFlow": "bg-purple-100 text-purple-800",
      "React Native": "bg-cyan-100 text-cyan-800",
      "Solidity": "bg-gray-100 text-gray-800",
      "Arduino": "bg-teal-100 text-teal-800"
    };
    return colors[tech as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Count total buttons to determine layout
  const buttonCount = 1 + (project.architectureDiagram ? 1 : 0) + (project.liveUrl ? 1 : 0);
  const hasThreeButtons = buttonCount === 3;

  const handleLike = async () => {
    if (!isLoggedIn) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    try {
      const res = await axiosInstance.post(`${API_URL}/projects/${project.id}/like`);
      if (res.data && res.data.success) {
        setLikes(res.data.likes);
        setLiked(res.data.liked);
      }
    } catch (e) {
      // Optionally show a toast
    }
  };

  const handleEngage = async (type: string) => {
    if (!isLoggedIn) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setEngageLoading(true);
    try {
      await axiosInstance.post('/profile/engagement', {
        toUser: project.authorId,
        project: project.id,
        type
      });
      toast.success('Engagement recorded!');
      
      // Add a small delay to ensure backend has processed the engagement
      setTimeout(async () => {
        try {
          // Use the correct endpoint for engagement counts
          const res = await axiosInstance.get(`/profile/project/${project.id}/engagement-counts`);
          if (res.data && res.data.success) {
            setEngageCounts(res.data.engagements || {});
            setTotalEngages(res.data.total || 0);
          }
        } catch (error) {
          console.error('Failed to refresh engagement counts:', error);
        }
      }, 400);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error('Failed to engage.');
      }
    } finally {
      setEngageLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate cursor-pointer"
                onClick={() => {
                  if (!isLoggedIn && onRequireLogin) {
                    onRequireLogin();
                    return;
                  }
                  navigate(`/project/${project.id}`);
                }}
                title={project.name}
              >
                {project.name}
              </CardTitle>
              {/* Author, Date, Project Type, Company (if internship) */}
              <div className="space-y-1 mt-2 text-sm text-gray-500">
                {/* Line 1: User icon + author name */}
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <button
                    className="hover:text-emerald-600 hover:underline transition-colors flex-1 text-left truncate"
                    title={`View profile for ${project.author}`}
                    onClick={() => onAuthorClick(project.authorId, project.author)}
                  >
                    {project.author}
                  </button>
                </div>
                {/* Line 2: Calendar icon + date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{project.internshipPeriod}</span>
                </div>
                {/* Line 3: Project type icon + type */}
                <div className="flex items-center gap-2">
                  {project.projectType === 'internship' ? (
                    <Briefcase className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <Star className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate capitalize">{project.projectType === 'internship' ? 'Internship' : 'Personal Project'}</span>
                </div>
                {/* Line 4: Company/Organization (if internship) */}
                {project.projectType === 'internship' && project.companyName ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{project.companyName}</span>
                  </div>
                ) : (
                  // Placeholder to keep header height consistent
                  <div style={{ height: '20px' }} aria-hidden="true"></div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {/* Hide favorite button for now */}
              {/*
              <button
                onClick={() => onToggleFavorite(project.id)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                  } transition-colors`}
                />
              </button>
              */}
              {isOwner && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="p-1 h-6 w-6 group/edit-btn"
                        aria-label="Edit Project"
                        onClick={() => onEdit && onEdit(project)}
                      >
                        <Pencil className="h-4 w-4 text-gray-400 group-hover/edit-btn:text-emerald-600 transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Project</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="p-1 h-6 w-6 group/delete-btn"
                        aria-label="Delete Project"
                        onClick={() => onDelete && onDelete(project)}
                      >
                        <Trash className="h-4 w-4 text-gray-400 group-hover/delete-btn:text-red-600 transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Project</TooltipContent>
                  </Tooltip>
                </>
              )}
              <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 space-y-4">
          <div className="flex-1 flex flex-col space-y-4">
            <div className="min-h-[56px]">
              <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
                {project.description}
              </CardDescription>
            </div>
            {/* Tech Stack */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">TECH STACK</p>
              <div className="flex flex-wrap gap-1">
                {project.techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className={`text-xs ${getTechColor(tech)}`}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {/* Links */}
          <TooltipProvider>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              {/* Repo Link button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2 py-1 text-xs flex items-center gap-1"
                    disabled={
                      project.repoVisibility === 'private' || (!isLoggedIn && project.repoVisibility === 'public')
                    }
                    onClick={e => {
                      if (project.repoVisibility === 'private') {
                        e.preventDefault();
                        toast.error('The user has set this repo to private.');
                        return;
                      }
                      if (!isLoggedIn && project.repoVisibility === 'public') {
                        e.preventDefault();
                        toast.error('Please log in to view the repo link.');
                        if (onRequireLogin) onRequireLogin();
                        return;
                      }
                      onGithubClick(e, project.githubUrl);
                    }}
                    asChild
                  >
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                    >
                      {project.repoVisibility === 'private' ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      <span className="truncate">Repo</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Repo</TooltipContent>
              </Tooltip>

              {/* Architecture button */}
              {project.architectureDiagram && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={project.architectureDiagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-xs flex items-center gap-1"
                        onClick={(e) => { if (!isLoggedIn && onRequireLogin) { e.preventDefault(); onRequireLogin(); return; } onArchitectureClick(e, project.architectureDiagram!); }}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate">Architecture</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Architecture</TooltipContent>
                </Tooltip>
              )}

              {/* Live Demo button */}
              {project.liveUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={-1}
                    >
                      <Button
                        size="sm"
                        className="px-2 py-1 text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={(e) => { if (!isLoggedIn && onRequireLogin) { e.preventDefault(); onRequireLogin(); return; } onLiveDemoClick(e, project.liveUrl!); }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">Live Demo</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Live Demo</TooltipContent>
                </Tooltip>
              )}

              {/* Only render Engage button if the current user is NOT the owner */}
              {project.authorId !== user?.id && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1 text-xs flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          <span className="truncate">Engage</span>
                          <span className="ml-1 text-xs text-emerald-600 font-semibold">{totalEngages}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {engageTypes.map(type => (
                          <DropdownMenuItem key={type.value} onClick={() => handleEngage(type.value)} disabled={engageLoading}>
                            {type.label}
                            {engageCounts[type.value] ? (
                              <span className="ml-2 text-xs text-gray-500">({engageCounts[type.value]})</span>
                            ) : null}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>Engage</TooltipContent>
                </Tooltip>
              )}

              {/* Like button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 flex items-center gap-1 text-xs ${liked ? 'text-emerald-600' : 'text-gray-500'}`}
                    onClick={handleLike}
                    aria-label={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart fill={liked ? '#059669' : 'none'} strokeWidth={2} className="h-3 w-3" />
                    <span>{likes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProjectCard;
