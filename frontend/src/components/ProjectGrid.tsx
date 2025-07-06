import { Filter } from "lucide-react";
import ProjectCard from "./ProjectCard";

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

interface ProjectGridProps {
  projects: Project[];
  isLoggedIn: boolean;
  favorites: Set<string>;
  onToggleFavorite: (projectId: string) => void;
  onAuthorClick: (authorId: string, authorName: string) => void;
  onGithubClick: (e: React.MouseEvent, githubUrl: string) => void;
  onLiveDemoClick: (e: React.MouseEvent, liveUrl: string) => void;
  onArchitectureClick: (e: React.MouseEvent, architectureUrl: string) => void;
  showSearchNoResults?: boolean;
  onSubmitProject?: () => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

const ProjectGrid = ({
  projects,
  isLoggedIn,
  favorites,
  onToggleFavorite,
  onAuthorClick,
  onGithubClick,
  onLiveDemoClick,
  onArchitectureClick,
  showSearchNoResults,
  onSubmitProject,
  onEditProject,
  onDeleteProject
}: ProjectGridProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          {showSearchNoResults ? (
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more projects.
            </p>
          ) : (
            <button
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition"
              onClick={onSubmitProject}
            >
              Be the first to submit a project!
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={{ ...project, projectType: (project as any).projectType || '' }}
          isLoggedIn={isLoggedIn}
          isFavorite={false} // Hide favorite state
          onToggleFavorite={() => {}} // Disable favorite toggle
          onAuthorClick={() => onAuthorClick(project.authorId, project.author)}
          onGithubClick={onGithubClick}
          onLiveDemoClick={onLiveDemoClick}
          onArchitectureClick={onArchitectureClick}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
