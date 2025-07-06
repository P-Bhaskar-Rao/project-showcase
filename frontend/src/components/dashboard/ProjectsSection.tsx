import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Github, ExternalLink, Plus } from "lucide-react";

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

interface ProjectsSectionProps {
  userProjects: Project[];
  favoriteProjects: Project[];
  onSubmitProject: () => void;
  favorites: Set<string>;
  toggleFavorite: (projectId: string) => void;
}

const ProjectsSection = ({ userProjects, favoriteProjects, onSubmitProject, favorites, toggleFavorite }: ProjectsSectionProps) => {
  const renderProjectCard = (project: Project, showAuthor: boolean = false) => (
    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
        <h3 className="font-semibold text-base sm:text-lg">{project.name}</h3>
        <Badge variant="outline" className="self-start">{project.category}</Badge>
      </div>
      
      {showAuthor && (
        <p className="text-gray-600 text-sm mb-2">By {project.author}</p>
      )}
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {project.description}
      </p>
      
      {project.projectType === "internship" && project.companyName && (
        <p className="text-sm text-blue-600 mb-2">
          📢 {project.companyName} Internship
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 mb-3">
        {project.techStack.slice(0, 3).map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs">
            {tech}
          </Badge>
        ))}
        {project.techStack.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{project.techStack.length - 3} more
          </Badge>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500">
        <span>{project.internshipPeriod}</span>
        <div className="flex gap-2 items-center">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-700"
          >
            <Github className="h-4 w-4" />
          </a>
          {project.liveUrl && (
            <a 
              href={project.liveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* My Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Code className="h-5 w-5" />
            My Projects ({userProjects.length})
          </CardTitle>
          <Button onClick={onSubmitProject} size="sm" className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Project</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardHeader>
        <CardContent>
          {userProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No projects submitted yet</p>
              <p className="text-xs sm:text-sm mt-1">Start by submitting your first project!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {userProjects.map((project) => renderProjectCard(project))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorite Projects - Hidden */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Heart className="h-5 w-5" />
            Favorite Projects ({favoriteProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No favorite projects yet</p>
              <p className="text-xs sm:text-sm mt-1">Start exploring and add projects to your favorites!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {favoriteProjects.map((project) => renderProjectCard(project, true))}
            </div>
          )}
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default ProjectsSection;
