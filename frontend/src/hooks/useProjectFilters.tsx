import { useState, useMemo } from "react";
import { Project } from "../types/Project";

export const useProjectFilters = (projects: Project[], selectedCategory: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Remove internal selectedCategory state, use prop instead
  const [selectedTech, setSelectedTech] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const filteredProjects = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const filtered = projects.filter(project => {
      // Global search: name, description, author, techStack, category, companyName, projectType, internshipPeriod
      const matchesSearch =
        project.name.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search) ||
        project.author.toLowerCase().includes(search) ||
        (project.techStack && project.techStack.some(tech => tech.toLowerCase().includes(search))) ||
        (project.category && project.category.toLowerCase().includes(search)) ||
        (project.companyName && project.companyName.toLowerCase().includes(search)) ||
        (project.projectType && project.projectType.toLowerCase().includes(search)) ||
        (project.internshipPeriod && project.internshipPeriod.toLowerCase().includes(search));

      // Accept both 'All' and 'All Categories' as no filter
      const matchesCategory =
        selectedCategory === "All" ||
        selectedCategory === "All Categories" ||
        (project.category && project.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      const matchesTech = selectedTech === "All" || (project.techStack && project.techStack.includes(selectedTech));
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
    selectedTech,
    setSelectedTech,
    sortBy,
    setSortBy,
    filteredProjects
  };
};
