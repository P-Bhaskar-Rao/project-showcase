import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  categoryOptions: string[]; // <-- new prop
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
  filteredCount,
  categoryOptions // <-- new prop
}: SearchFiltersProps) => {
  return (
    <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200 w-full">
      <style>{`
        .no-focus-outline input:focus,
        .no-focus-outline button:focus,
        .no-focus-outline [data-radix-focus-guard]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .no-focus-outline *:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      <div className="flex gap-3 items-center overflow-x-auto no-focus-outline">
        {/* Search - takes more space */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-9 text-sm rounded-md border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 focus:outline-none outline-none shadow-none focus:shadow-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="flex-shrink-0 w-28">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 text-sm rounded-md border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 focus:outline-none outline-none shadow-none focus:shadow-none transition-colors">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {categoryOptions && categoryOptions.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Technology */}
        <div className="flex-shrink-0 w-28">
          <Select value={selectedTech} onValueChange={setSelectedTech}>
            <SelectTrigger className="h-9 text-sm rounded-md border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 focus:outline-none outline-none shadow-none focus:shadow-none transition-colors">
              <SelectValue placeholder="Tech" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tech</SelectItem>
              {techOptions && techOptions.map(tech => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex-shrink-0 w-28">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 text-sm rounded-md border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 focus:outline-none outline-none shadow-none focus:shadow-none transition-colors">
              <SelectValue placeholder="Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">A–Z</SelectItem>
              <SelectItem value="author">Author</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
