import { useState, useMemo } from "react";
import { Project } from "../types/Project";

export const useProjectFilters = (projects: Project[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesTech = selectedTech === "All" || project.techStack.includes(selectedTech);
      
      return matchesSearch && matchesCategory && matchesTech;
    });

    // Sort projects
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "author":
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
      default:
        break;
    }

    return filtered;
  }, [projects, searchTerm, selectedCategory, selectedTech, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    filteredProjects
  };
};
