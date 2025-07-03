
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import AuthorModal from "@/components/AuthorModal";
import ProjectSubmissionModal from "@/components/ProjectSubmissionModal";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import ProjectGrid from "@/components/ProjectGrid";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useFavorites } from "@/hooks/useFavorites";

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

interface Author {
  name: string;
  email: string;
  college: string;
  location: string;
  joinDate: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
}

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Task Manager Pro",
    description: "A full-stack task management application with real-time collaboration features and advanced project tracking.",
    author: "Sarah Chen",
    techStack: ["React", "Node.js", "MongoDB", "Socket.io"],
    category: "Web App",
    githubUrl: "https://github.com/sarahchen/task-manager-pro",
    liveUrl: "https://task-manager-pro-demo.vercel.app",
    internshipPeriod: "Jun 2024 - Aug 2024",
    architectureDiagram: "https://example.com/task-manager-architecture.png"
  },
  {
    id: "2",
    name: "AI Code Reviewer",
    description: "Machine learning tool that analyzes code quality and provides intelligent suggestions for improvements.",
    author: "Marcus Rodriguez",
    techStack: ["Python", "TensorFlow", "FastAPI", "React"],
    category: "AI/ML",
    githubUrl: "https://github.com/marcus/ai-code-reviewer",
    internshipPeriod: "Sep 2024 - Dec 2024",
    architectureDiagram: "https://example.com/ai-code-reviewer-architecture.png"
  },
  {
    id: "3",
    name: "Mobile Expense Tracker",
    description: "Cross-platform mobile app for tracking expenses with AI-powered categorization and financial insights.",
    author: "Emily Johnson",
    techStack: ["React Native", "Firebase", "TypeScript"],
    category: "Mobile App",
    githubUrl: "https://github.com/emily/expense-tracker",
    liveUrl: "https://play.google.com/store/apps/details?id=com.expense.tracker",
    internshipPeriod: "Jun 2024 - Aug 2024"
  },
  {
    id: "4",
    name: "Real-time Analytics Dashboard",
    description: "Interactive dashboard for visualizing real-time business metrics with customizable widgets and alerts.",
    author: "David Kim",
    techStack: ["Vue.js", "D3.js", "PostgreSQL", "Express"],
    category: "Web App",
    githubUrl: "https://github.com/davidkim/analytics-dashboard",
    liveUrl: "https://analytics-dashboard-demo.netlify.app",
    internshipPeriod: "Jan 2024 - May 2024",
    architectureDiagram: "https://example.com/analytics-dashboard-architecture.png"
  },
  {
    id: "5",
    name: "Blockchain Voting System",
    description: "Secure, transparent voting platform built on blockchain technology with identity verification.",
    author: "Priya Patel",
    techStack: ["Solidity", "Web3.js", "React", "Ethereum"],
    category: "Blockchain",
    githubUrl: "https://github.com/priya/blockchain-voting",
    internshipPeriod: "Sep 2024 - Dec 2024"
  },
  {
    id: "6",
    name: "Smart Home IoT Controller",
    description: "IoT application for controlling smart home devices with voice commands and automated routines.",
    author: "Alex Thompson",
    techStack: ["Arduino", "Python", "Flask", "React"],
    category: "IoT",
    githubUrl: "https://github.com/alex/smart-home-controller",
    internshipPeriod: "Jun 2024 - Aug 2024"
  }
];

const sampleAuthors: Record<string, Author> = {
  "Sarah Chen": {
    name: "Sarah Chen",
    email: "sarah.chen@university.edu",
    college: "Stanford University",
    location: "San Francisco, CA",
    joinDate: "June 2024",
    bio: "Computer Science student passionate about full-stack development and user experience design. Love building applications that solve real-world problems.",
    skills: ["React", "Node.js", "MongoDB", "UI/UX Design", "TypeScript"],
    github: "https://github.com/sarahchen",
    linkedin: "https://linkedin.com/in/sarahchen"
  },
  "Marcus Rodriguez": {
    name: "Marcus Rodriguez",
    email: "marcus.r@tech.edu",
    college: "MIT",
    location: "Boston, MA",
    joinDate: "September 2024",
    bio: "AI/ML enthusiast working on innovative solutions for code analysis and developer productivity tools.",
    skills: ["Python", "TensorFlow", "FastAPI", "Machine Learning", "Data Science"],
    github: "https://github.com/marcus",
    linkedin: "https://linkedin.com/in/marcusrodriguez"
  },
  "Emily Johnson": {
    name: "Emily Johnson",
    email: "emily.j@college.edu",
    college: "UC Berkeley",
    location: "Berkeley, CA",
    joinDate: "May 2024",
    bio: "Mobile app developer focused on creating intuitive financial applications that help people manage their money better.",
    skills: ["React Native", "Firebase", "TypeScript", "Mobile Development", "Fintech"],
    github: "https://github.com/emily"
  },
  "David Kim": {
    name: "David Kim",
    email: "david.kim@university.edu",
    college: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    joinDate: "March 2024",
    bio: "Data visualization specialist with expertise in creating interactive dashboards and analytics tools.",
    skills: ["Vue.js", "D3.js", "PostgreSQL", "Data Visualization", "Analytics"],
    github: "https://github.com/davidkim"
  },
  "Priya Patel": {
    name: "Priya Patel",
    email: "priya.patel@tech.edu",
    college: "Georgia Tech",
    location: "Atlanta, GA",
    joinDate: "August 2024",
    bio: "Blockchain developer interested in creating secure and transparent systems for democratic processes.",
    skills: ["Solidity", "Web3.js", "React", "Blockchain", "Smart Contracts"],
    github: "https://github.com/priya"
  },
  "Alex Thompson": {
    name: "Alex Thompson",
    email: "alex.t@university.edu",
    college: "University of Washington",
    location: "Seattle, WA",
    joinDate: "July 2024",
    bio: "IoT developer passionate about smart home technology and automation systems.",
    skills: ["Arduino", "Python", "Flask", "IoT", "Hardware"],
    github: "https://github.com/alex"
  }
};

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const { toast } = useToast();

  // Use custom hooks
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    filteredProjects
  } = useProjectFilters(projects);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const { favorites, toggleFavorite } = useFavorites(isLoggedIn, openAuthModal);

  const techOptions = useMemo(() => 
    Array.from(new Set(projects.flatMap(p => p.techStack))).sort(), 
    [projects]
  );

  const openAuthorModal = (authorName: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view author profiles.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    
    const author = sampleAuthors[authorName];
    if (author) {
      setSelectedAuthor(author);
      setIsAuthorModalOpen(true);
    }
  };

  const handleGithubClick = (e: React.MouseEvent, githubUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view project code.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleLiveDemoClick = (e: React.MouseEvent, liveUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view live demos.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleArchitectureClick = (e: React.MouseEvent, architectureUrl: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: "Please sign in to view architecture diagrams.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    // Allow the default behavior to open the link
  };

  const handleSubmitProject = () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your project.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    setIsSubmissionModalOpen(true);
  };

  const handleProjectSubmission = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setIsSubmissionModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        isLoggedIn={isLoggedIn}
        onAuthModalOpen={openAuthModal}
        onSubmitProject={handleSubmitProject}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTech={selectedTech}
          setSelectedTech={setSelectedTech}
          sortBy={sortBy}
          setSortBy={setSortBy}
          techOptions={techOptions}
          totalProjects={projects.length}
          filteredCount={filteredProjects.length}
        />

        <ProjectGrid
          projects={filteredProjects}
          isLoggedIn={isLoggedIn}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onAuthorClick={openAuthorModal}
          onGithubClick={handleGithubClick}
          onLiveDemoClick={handleLiveDemoClick}
          onArchitectureClick={handleArchitectureClick}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Built with ❤️ to showcase the incredible work of our intern community
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={() => setIsLoggedIn(true)}
      />
      
      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        author={selectedAuthor}
      />

      <ProjectSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleProjectSubmission}
      />
    </div>
  );
};

export default Index;
