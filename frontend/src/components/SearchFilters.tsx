
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["All", "Web App", "Mobile App", "AI/ML", "Blockchain", "IoT"];

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTech: string;
  setSelectedTech: (tech: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  techOptions: string[];
  totalProjects: number;
  filteredCount: number;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedTech,
  setSelectedTech,
  sortBy,
  setSortBy,
  techOptions,
  totalProjects,
  filteredCount
}: SearchFiltersProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects, authors, or technologies..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tech Filter */}
        <Select value={selectedTech} onValueChange={setSelectedTech}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Technology" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Technologies</SelectItem>
            {techOptions.map(tech => (
              <SelectItem key={tech} value={tech}>{tech}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-4">
        <p className="text-sm text-gray-600">
          Showing {filteredCount} of {totalProjects} projects
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
            <SelectItem value="author">By Author</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
