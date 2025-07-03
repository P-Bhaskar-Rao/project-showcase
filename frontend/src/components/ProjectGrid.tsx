import { Filter } from "lucide-react";
import ProjectCard from "./ProjectCard";

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

interface ProjectGridProps {
  projects: Project[];
  isLoggedIn: boolean;
  favorites: Set<string>;
  onToggleFavorite: (projectId: string) => void;
  onAuthorClick: (authorName: string) => void;
  onGithubClick: (e: React.MouseEvent, githubUrl: string) => void;
  onLiveDemoClick: (e: React.MouseEvent, liveUrl: string) => void;
  onArchitectureClick: (e: React.MouseEvent, architectureUrl: string) => void;
}

const ProjectGrid = ({
  projects,
  isLoggedIn,
  favorites,
  onToggleFavorite,
  onAuthorClick,
  onGithubClick,
  onLiveDemoClick,
  onArchitectureClick
}: ProjectGridProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find more projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isLoggedIn={isLoggedIn}
          isFavorite={favorites.has(project.id)}
          onToggleFavorite={onToggleFavorite}
          onAuthorClick={onAuthorClick}
          onGithubClick={onGithubClick}
          onLiveDemoClick={onLiveDemoClick}
          onArchitectureClick={onArchitectureClick}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
