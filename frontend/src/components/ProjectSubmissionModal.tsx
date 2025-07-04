
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
}

const ProjectSubmissionModal = ({ isOpen, onClose, onSubmit }: ProjectSubmissionModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    author: "",
    category: "",
    githubUrl: "",
    liveUrl: "",
    projectType: "personal", // "personal" or "internship"
    companyName: "",
    internshipStartDate: "",
    internshipEndDate: "",
    projectStartDate: "",
    projectEndDate: "",
    architectureDiagram: "",
    techStack: [] as string[]
  });
  const [newTech, setNewTech] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    const requiredFields = ['name', 'description', 'author', 'category', 'githubUrl'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0 || formData.techStack.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one technology.",
        variant: "destructive",
      });
      return;
    }

    // Project type specific validation
    if (formData.projectType === "internship") {
      if (!formData.companyName || !formData.internshipStartDate || !formData.internshipEndDate) {
        toast({
          title: "Missing Internship Information",
          description: "Please fill in company name and internship dates.",
          variant: "destructive",
        });
        return;
      }
      
      if (new Date(formData.internshipEndDate + "-01") <= new Date(formData.internshipStartDate + "-01")) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date.",
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
      
      if (new Date(formData.projectEndDate + "-01") <= new Date(formData.projectStartDate + "-01")) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const newProject = {
        id: Date.now().toString(),
        ...formData,
        // Create a formatted period string for display
        internshipPeriod: formData.projectType === "internship" 
          ? `${formatMonthYear(formData.internshipStartDate)} - ${formatMonthYear(formData.internshipEndDate)}`
          : `${formatMonthYear(formData.projectStartDate)} - ${formatMonthYear(formData.projectEndDate)}`
      };
      
      onSubmit(newProject);
      
      toast({
        title: "Project Submitted!",
        description: "Your project has been successfully submitted and is now visible.",
      });
      
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
        techStack: []
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
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
          <CardTitle className="text-emerald-600">Submit Your Project</CardTitle>
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

            {/* Author Name */}
            <div className="space-y-2">
              <Label htmlFor="author">Your Name *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Project Type */}
            <div className="space-y-3">
              <Label>Project Type *</Label>
              <RadioGroup
                value={formData.projectType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">Personal Project</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internship" id="internship" />
                  <Label htmlFor="internship">Internship Project</Label>
                </div>
              </RadioGroup>
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
                <Button type="button" onClick={addTechStack} size="icon">
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
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Repository URL *</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username/repository"
                required
              />
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
