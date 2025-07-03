
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isLoggedIn: boolean;
  onAuthModalOpen: (mode: 'login' | 'signup') => void;
  onSubmitProject: () => void;
}

const Header = ({ isLoggedIn, onAuthModalOpen, onSubmitProject }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600">
              InternShowcase
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Discover amazing projects built by talented interns</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isLoggedIn ? (
              <>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                  onClick={onSubmitProject}
                >
                  Submit Project
                </Button>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onAuthModalOpen('login')} className="flex-1 sm:flex-none">
                  Sign In
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                  onClick={() => onAuthModalOpen('signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
