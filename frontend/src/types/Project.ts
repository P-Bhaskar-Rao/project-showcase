export interface Project {
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
  projectType?: string;
  companyName?: string;
  likes?: string[];
  engages?: { type: string; userId: string }[];
  repoVisibility?: string;
} 