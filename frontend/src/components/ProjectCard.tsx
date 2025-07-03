
import { Github, ExternalLink, Calendar, User, Heart, Lock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  image?: string;
  architectureDiagram?: string;
}

interface ProjectCardProps {
  project: Project;
  isLoggedIn: boolean;
  isFavorite: boolean;
  onToggleFavorite: (projectId: string) => void;
  onAuthorClick: (authorName: string) => void;
  onGithubClick: (e: React.MouseEvent, githubUrl: string) => void;
  onLiveDemoClick: (e: React.MouseEvent, liveUrl: string) => void;
  onArchitectureClick: (e: React.MouseEvent, architectureUrl: string) => void;
}

const ProjectCard = ({
  project,
  isLoggedIn,
  isFavorite,
  onToggleFavorite,
  onAuthorClick,
  onGithubClick,
  onLiveDemoClick,
  onArchitectureClick
}: ProjectCardProps) => {
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
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                {project.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <button 
                    className="hover:text-emerald-600 hover:underline transition-colors truncate"
                    onClick={() => onAuthorClick(project.author)}
                  >
                    {project.author}
                  </button>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{project.internshipPeriod}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
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
              <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
            {project.description}
          </CardDescription>

          {/* Tech Stack */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tech Stack</p>
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
