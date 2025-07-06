import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useAuthStore } from "@/store/useAuthStore"; // Import Zustand store
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react"; // Import icons
import { useToast } from "@/hooks/use-toast"; // Import useToast for notifications
import axiosInstance from "@/api/axiosInstance";
import { useNavigate, Link, useLocation } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  onAuthModalOpen: (mode: 'login' | 'signup') => void;
  onSubmitProject: () => void;
}

const API_URL = import.meta.env.VITE_API_URL; // Ensure API_URL is accessible

const Header = ({ isLoggedIn, onAuthModalOpen, onSubmitProject }: HeaderProps) => {
  const user = useAuthStore((state) => state.user); // Get user from Zustand
  const clearAuth = useAuthStore((state) => state.clearAuth); // Get clearAuth from Zustand
  const { toast } = useToast(); // Initialize toast
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkBase = "relative px-2 py-1 sm:px-3 sm:py-2 rounded-md font-semibold text-sm sm:text-base text-center transition-all duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-emerald-600 after:transition-transform after:duration-300 after:origin-left";

  // Function to get the first letter of the user's name
  const getUserInitial = (name: string | null | undefined) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = async () => {
    try {
      // Call your backend logout API to clear refresh token from DB and cookie
      const response = await axiosInstance.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true // Important to send the httpOnly refresh token cookie
      });

      if (response.data.success) {
        toast({
          title: "Logged out successfully!",
          description: "You have been logged out of your account.",
        });
      } else {
        // Even if backend reports failure, clear frontend state for consistency
        toast({
          title: "Logout attempted",
          description: response.data.message || "Could not fully log out on server, but frontend state cleared.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Logout failed on backend:", error);
      toast({
        title: "Logout failed",
        description: error.response?.data?.error || "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      clearAuth();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-[75%]">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600">
              ProjectShowcase
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Discover amazing projects built by talented interns</p>
          </div>
          {/* Nav and Auth Row: on mobile, links left, buttons right; on md+, all grouped right with gap */}
          <div className="w-full md:w-[25%] flex flex-row items-center justify-between md:justify-end md:gap-8">
            <nav className="flex flex-row flex-nowrap gap-2">
              <Link
                to="/"
                className={`${navLinkBase} ${location.pathname === '/' ? 'text-emerald-600 after:scale-x-100 after:decoration-4' : 'text-gray-700 hover:text-emerald-600 after:scale-x-0 hover:after:scale-x-100 after:decoration-4'}`}
              >
                Home
              </Link>
              <Link
                to="/projects"
                className={`${navLinkBase} ${location.pathname === '/projects' ? 'text-emerald-600 after:scale-x-100 after:decoration-4' : 'text-gray-700 hover:text-emerald-600 after:scale-x-0 hover:after:scale-x-100 after:decoration-4'}`}
              >
                Projects
              </Link>
            </nav>
            <div className="flex flex-row gap-2">
              {isLoggedIn ? (
                <>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base"
                    onClick={onSubmitProject}
                  >
                    Submit Project
                  </Button>
                  {/* <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base flex items-center justify-center"
                    onClick={() => navigate('/dashboard')}
                    aria-label="Dashboard"
                    title="Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    <span>Dashboard</span>
                  </Button> */}
                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full overflow-hidden p-0 flex items-center justify-center border border-emerald-600" 
                      >
                        <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                          {getUserInitial(user?.name)} {/* Dynamically get user initial */}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onAuthModalOpen('login')}
                    className="px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base"
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base"
                    onClick={() => onAuthModalOpen('signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
