
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Code, Calendar, ExternalLink, Github } from "lucide-react";

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

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProjects: Project[];
  favoriteProjects: Project[];
  userInfo: {
    name: string;
    email: string;
    joinDate: string;
    totalProjects: number;
    totalFavorites: number;
  };
}

const UserDashboard = ({ 
  isOpen, 
  onClose, 
  userProjects, 
  favoriteProjects, 
  userInfo 
}: UserDashboardProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-emerald-600">Dashboard</h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{userInfo.name}</div>
                  <div className="text-sm text-gray-600">{userInfo.email}</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userInfo.totalProjects}</div>
                  <div className="text-sm text-gray-600">Projects Submitted</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{userInfo.totalFavorites}</div>
                  <div className="text-sm text-gray-600">Favorite Projects</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    <Calendar className="h-6 w-6 mx-auto mb-1" />
                  </div>
                  <div className="text-sm text-gray-600">Joined {userInfo.joinDate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                My Projects ({userProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects submitted yet</p>
                  <p className="text-sm">Start by submitting your first project!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      
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
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{project.internshipPeriod}</span>
                        <div className="flex gap-2">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorite Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Favorite Projects ({favoriteProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoriteProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No favorite projects yet</p>
                  <p className="text-sm">Start exploring and add projects to your favorites!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">By {project.author}</p>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      
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
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{project.internshipPeriod}</span>
                        <div className="flex gap-2">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
