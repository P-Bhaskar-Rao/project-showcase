import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Calendar, 
  User, 
  FileText, 
  Lock, 
  Briefcase, 
  Building2, 
  Star,
  Code,
  Heart,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const getTechColor = (tech: string) => {
  const colors: Record<string, string> = {
    "React": "bg-blue-50 text-blue-700 ring-blue-200",
    "Node.js": "bg-green-50 text-green-700 ring-green-200",
    "Python": "bg-yellow-50 text-yellow-700 ring-yellow-200",
    "MongoDB": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "TypeScript": "bg-indigo-50 text-indigo-700 ring-indigo-200",
    "Vue.js": "bg-teal-50 text-teal-700 ring-teal-200",
    "Firebase": "bg-orange-50 text-orange-700 ring-orange-200",
    "PostgreSQL": "bg-purple-50 text-purple-700 ring-purple-200",
    "TensorFlow": "bg-pink-50 text-pink-700 ring-pink-200",
    "Google Cloud": "bg-red-50 text-red-700 ring-red-200",
    "Flask": "bg-gray-50 text-gray-700 ring-gray-200",
    "Redis": "bg-rose-50 text-rose-700 ring-rose-200"
  };
  return colors[tech] || "bg-gray-50 text-gray-700 ring-gray-200";
};

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;
  const [likes, setLikes] = useState(project?.likes ? project.likes.length : 0);
  const [liked, setLiked] = useState(project?.likes ? project.likes.includes(user?.id) : false);
  const [engageCount, setEngageCount] = useState<number>(0);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axiosInstance.get(`/projects/${id}`);
        setProject(res.data.project);
        const engagesRes = await axiosInstance.get(`/projects/${id}/engages`);
        if (engagesRes.data && engagesRes.data.success) {
          setEngageCount(engagesRes.data.total || 0);
        }
      } catch (err) {
        setError("Project not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      setLikes(project.likes ? project.likes.length : 0);
      setLiked(project.likes ? project.likes.includes(user?.id) : false);
    }
  }, [project, user]);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axiosInstance.post(`${API_URL}/projects/${project._id || project.id}/like`);
      if (res.data && res.data.success) {
        setLikes(res.data.likes);
        setLiked(res.data.liked);
      }
    } catch (e) {}
  };

  if (loading) return <div className="flex justify-center items-center h-96 text-lg">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-96 text-red-600">{error}</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8">
      {/* Back Button */}
      <div className="mb-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Projects</span>
        </button>
      </div>
      {/* Main Card Container */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-white px-8 py-8 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Project Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4 text-gray-900">{project.name}</h1>
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                    {project.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 flex items-center gap-1">
                    {project.projectType === 'internship' ? (
                      <>
                        <Briefcase className="h-3 w-3" />
                        Internship Project
                      </>
                    ) : (
                      <>
                        <Star className="h-3 w-3" />
                        Personal Project
                      </>
                    )}
                  </span>
                  {project.companyName && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {project.companyName}
                    </span>
                  )}
                </div>
                {/* Meta Info */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>By {project.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{project.internshipPeriod}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Engagements count */}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-700 font-semibold text-sm">{engageCount} Engagement{engageCount === 1 ? '' : 's'}</span>
                </div>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <Github className="h-4 w-4" />
                    <span>View Code</span>
                  </button>
                </a>
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      <ExternalLink className="h-4 w-4" />
                      <span>Live Demo</span>
                    </button>
                  </a>
                )}
                {project.architectureDiagram && (
                  <a href={project.architectureDiagram} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium border border-gray-300">
                      <FileText className="h-4 w-4" />
                      <span>Architecture</span>
                    </button>
                  </a>
                )}
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-sm font-medium transition ${liked ? 'text-emerald-600 border-emerald-300' : 'text-gray-500 border-gray-200 hover:text-emerald-600 hover:border-emerald-300'}`}
                  onClick={handleLike}
                  disabled={!isLoggedIn}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <Heart fill={liked ? '#059669' : 'none'} strokeWidth={2} className="h-5 w-5" />
                  <span>{likes}</span>
                </button>
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    About This Project
                  </h2>
                  <div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                </div>
                {/* Tech Stack */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-emerald-600" />
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ring-1 ${getTechColor(tech)} hover:scale-105 transition-transform cursor-default`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sidebar - Empty for now */}
              <div className="space-y-6">
                {/* Sidebar content removed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
