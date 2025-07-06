import { Github, ExternalLink, Calendar, User, Heart, Lock, FileText, Pencil, Trash, Briefcase, Building2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  projectType: string;
  companyName?: string;
}

interface ProjectCardProps {
  project: Project;
  isLoggedIn: boolean;
  isFavorite: boolean;
  onToggleFavorite: (projectId: string) => void;
  onAuthorClick: (authorId: string, authorName: string) => void;
  onGithubClick: (e: React.MouseEvent, githubUrl: string) => void;
  onLiveDemoClick: (e: React.MouseEvent, liveUrl: string) => void;
  onArchitectureClick: (e: React.MouseEvent, architectureUrl: string) => void;
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
  onEdit,
  onDelete
}: ProjectCardProps) => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  useEffect(() => {
    console.log('[DEBUG] ProjectCard user:', user);
    console.log('[DEBUG] ProjectCard accessToken:', accessToken);
  }, [user, accessToken]);

  console.log('[DEBUG] ProjectCard user:', user, 'project.authorId:', project.authorId);
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

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
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
          <div className={`pt-2 ${hasThreeButtons ? 'space-y-2' : 'flex gap-2'}`}>
            {/* First row - Code button (always present) */}
            <div className={hasThreeButtons ? 'flex' : 'contents'}>
              <Button
                variant="outline"
                size="sm"
                className={`${hasThreeButtons ? 'flex-1' : 'flex-1'} hover:bg-gray-50`}
                onClick={(e) => onGithubClick(e, project.githubUrl)}
                asChild={isLoggedIn}
              >
                {isLoggedIn ? (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <Github className="h-4 w-4" />
                    <span>Code</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Code</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Second row/column - Architecture and Live Demo */}
            {(project.architectureDiagram || project.liveUrl) && (
              <div className={`flex gap-2 ${hasThreeButtons ? 'flex-1' : ''}`}>
                {project.architectureDiagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-50"
                    onClick={(e) => onArchitectureClick(e, project.architectureDiagram!)}
                    asChild={isLoggedIn}
                  >
                    {isLoggedIn ? (
                      <a href={project.architectureDiagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className={hasThreeButtons ? 'text-xs' : 'hidden sm:inline'}>
                          {hasThreeButtons ? 'Arch' : 'Architecture'}
                        </span>
                        {!hasThreeButtons && <span className="sm:hidden">Arch</span>}
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className={hasThreeButtons ? 'text-xs' : 'hidden sm:inline'}>
                          {hasThreeButtons ? 'Arch' : 'Architecture'}
                        </span>
                        {!hasThreeButtons && <span className="sm:hidden">Arch</span>}
                      </div>
                    )}
                  </Button>
                )}

                {project.liveUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={(e) => onLiveDemoClick(e, project.liveUrl!)}
                        asChild={isLoggedIn}
                      >
                        {isLoggedIn ? (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            <span className={hasThreeButtons ? 'text-xs' : 'hidden sm:inline'}>
                              {hasThreeButtons ? 'Demo' : 'Live Demo'}
                            </span>
                            {!hasThreeButtons && <span className="sm:hidden">Demo</span>}
                          </a>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span className={hasThreeButtons ? 'text-xs' : 'hidden sm:inline'}>
                              {hasThreeButtons ? 'Demo' : 'Live Demo'}
                            </span>
                            {!hasThreeButtons && <span className="sm:hidden">Demo</span>}
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The site may not be Live</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProjectCard;
