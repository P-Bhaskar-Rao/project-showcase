import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

// Define a Project type for props
interface Project {
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

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  initialData?: Project;
  onUpdate?: (project: Project) => void;
}

const ProjectSubmissionModal = ({ isOpen, onClose, onSubmit, initialData, onUpdate }: ProjectSubmissionModalProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    author: initialData?.author || "",
    category: initialData?.category || "",
    githubUrl: initialData?.githubUrl || "",
    liveUrl: initialData?.liveUrl || "",
    projectType: initialData?.projectType || "personal",
    companyName: initialData?.companyName || "",
    internshipStartDate: initialData?.internshipStartDate || "",
    internshipEndDate: initialData?.internshipEndDate || "",
    projectStartDate: initialData?.projectStartDate || "",
    projectEndDate: initialData?.projectEndDate || "",
    architectureDiagram: initialData?.architectureDiagram || "",
    techStack: initialData?.techStack || [],
    repoVisibility: initialData?.repoVisibility || "public"
  });
  const [newTech, setNewTech] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const categories = [
    "Web App",
    "Mobile App", 
    "AI/ML",
    "Blockchain",
    "IoT",
    "Desktop App",
    "API/Backend",
    "Data Visualization",
    "Game",
    "DevTools"
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        author: initialData.author || "",
        category: initialData.category || "",
        githubUrl: initialData.githubUrl || "",
        liveUrl: initialData.liveUrl || "",
        projectType: initialData.projectType || "personal",
        companyName: initialData.companyName || "",
        internshipStartDate: initialData.internshipStartDate || "",
        internshipEndDate: initialData.internshipEndDate || "",
        projectStartDate: initialData.projectStartDate || "",
        projectEndDate: initialData.projectEndDate || "",
        architectureDiagram: initialData.architectureDiagram || "",
        techStack: initialData.techStack || [],
        repoVisibility: initialData.repoVisibility || "public"
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        author: "",
        category: "",
        githubUrl: "",
        liveUrl: "",
        projectType: "personal",
        companyName: "",
        internshipStartDate: "",
        internshipEndDate: "",
        projectStartDate: "",
        projectEndDate: "",
        architectureDiagram: "",
        techStack: [],
        repoVisibility: "public"
      });
    }
  }, [initialData, isOpen]);

  const addTechStack = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const formatMonthYear = (monthYear: string) => {
    if (!monthYear) return "";
    const date = new Date(monthYear + "-01");
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['name', 'description', 'category', 'githubUrl'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0 || formData.techStack.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one technology.",
        variant: "destructive",
      });
      return;
    }

    // Date should not be in the future
    const today = new Date();
    today.setHours(0,0,0,0); // ignore time
    let startDate, endDate;
    if (formData.projectType === "internship") {
      if (!formData.companyName || !formData.internshipStartDate || !formData.internshipEndDate) {
        toast({
          title: "Missing Internship Information",
          description: "Please fill in company name and internship dates.",
          variant: "destructive",
        });
        return;
      }
      startDate = new Date(formData.internshipStartDate + "-01");
      endDate = new Date(formData.internshipEndDate + "-01");
      if (startDate > today || endDate > today) {
        toast({
          title: "Invalid Dates",
          description: "Internship dates cannot be in the future.",
          variant: "destructive",
        });
        return;
      }
      if (endDate < startDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after or same as start date.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.projectStartDate || !formData.projectEndDate) {
        toast({
          title: "Missing Project Information",
          description: "Please fill in project start and end dates.",
          variant: "destructive",
        });
        return;
      }
      startDate = new Date(formData.projectStartDate + "-01");
      endDate = new Date(formData.projectEndDate + "-01");
      if (startDate > today || endDate > today) {
        toast({
          title: "Invalid Dates",
          description: "Project dates cannot be in the future.",
          variant: "destructive",
        });
        return;
      }
      if (endDate < startDate) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after or same as start date.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      console.log('[DEBUG] Current user:', user);
      const newProject = {
        id: initialData?.id || Date.now().toString(),
        ...formData,
        author: user?.name || "",
        authorId: user?.id || "",
        internshipPeriod: formData.projectType === "internship" 
          ? `${formatMonthYear(formData.internshipStartDate)} - ${formatMonthYear(formData.internshipEndDate)}`
          : `${formatMonthYear(formData.projectStartDate)} - ${formatMonthYear(formData.projectEndDate)}`
      };
      if (initialData && onUpdate) {
        await onUpdate(newProject);
      } else {
        onSubmit(newProject);
      }
      toast({
        title: initialData ? "Project Updated!" : "Project Submitted!",
        description: initialData ? "Your project has been updated." : "Your project has been successfully submitted and is now visible.",
      });
      // Navigate to projects page after successful submission
      navigate("/projects");
      // Reset form
      setFormData({
        name: "",
        description: "",
        author: "",
        category: "",
        githubUrl: "",
        liveUrl: "",
        projectType: "personal",
        companyName: "",
        internshipStartDate: "",
        internshipEndDate: "",
        projectStartDate: "",
        projectEndDate: "",
        architectureDiagram: "",
        techStack: [],
        repoVisibility: "public"
      });
      onClose();
    } catch (error) {
      toast({
        title: initialData ? "Update Failed" : "Submission Failed",
        description: "There was an error submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-emerald-600">{initialData ? 'Edit Your Project' : 'Submit Your Project'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your project name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project in detail..."
                rows={4}
                required
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label>Project Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="projectType"
                    value="personal"
                    checked={formData.projectType === "personal"}
                    onChange={() => setFormData(prev => ({ ...prev, projectType: "personal" }))}
                  />
                  Personal Project
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="projectType"
                    value="internship"
                    checked={formData.projectType === "internship"}
                    onChange={() => setFormData(prev => ({ ...prev, projectType: "internship" }))}
                  />
                  Internship Project
                </label>
              </div>
            </div>

            {/* Conditional Fields based on Project Type */}
            {formData.projectType === "internship" ? (
              <>
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                {/* Internship Period */}
                <div className="space-y-4">
                  <Label>Internship Period *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internshipStartDate">Start Month</Label>
                      <Input
                        id="internshipStartDate"
                        type="month"
                        value={formData.internshipStartDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, internshipStartDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internshipEndDate">End Month</Label>
                      <Input
                        id="internshipEndDate"
                        type="month"
                        value={formData.internshipEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, internshipEndDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Project Period */}
                <div className="space-y-4">
                  <Label>Project Period *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectStartDate">Start Month</Label>
                      <Input
                        id="projectStartDate"
                        type="month"
                        value={formData.projectStartDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectStartDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectEndDate">End Month</Label>
                      <Input
                        id="projectEndDate"
                        type="month"
                        value={formData.projectEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectEndDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                title="Project category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label>Technology Stack *</Label>
              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add a technology (e.g., React, Node.js)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                />
                <Button type="button" onClick={addTechStack} size="icon" title="Add technology">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.techStack.map(tech => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechStack(tech)}
                      className="ml-1 hover:text-red-500"
                      aria-label={`Remove ${tech}`}
                      title={`Remove ${tech}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Repo Link */}
            <div className="space-y-2">
              <Label htmlFor="githubUrl">Repo Link *</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://your-repo-host.com/user/repo"
                required
              />
            </div>
            {/* Repo Visibility */}
            <div className="space-y-2">
              <Label>Repo Link Visibility *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="repoVisibility"
                    value="public"
                    checked={formData.repoVisibility === "public"}
                    onChange={() => setFormData(prev => ({ ...prev, repoVisibility: "public" }))}
                  />
                  Public
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="repoVisibility"
                    value="private"
                    checked={formData.repoVisibility === "private"}
                    onChange={() => setFormData(prev => ({ ...prev, repoVisibility: "private" }))}
                  />
                  Private
                </label>
              </div>
            </div>

            {/* Live Demo URL */}
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live Demo URL (optional)</Label>
              <Input
                id="liveUrl"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://your-app.vercel.app"
              />
            </div>

            {/* Architecture Diagram */}
            <div className="space-y-2">
              <Label htmlFor="architectureDiagram">Architecture Diagram URL (optional)</Label>
              <Input
                id="architectureDiagram"
                type="url"
                value={formData.architectureDiagram}
                onChange={(e) => setFormData(prev => ({ ...prev, architectureDiagram: e.target.value }))}
                placeholder="https://example.com/architecture-diagram.png"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSubmissionModal;
