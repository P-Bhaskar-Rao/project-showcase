import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ProjectSubmissionModal from '@/components/ProjectSubmissionModal';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import axiosInstance from '@/api/axiosInstance';

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  // Dummy handler for now; you can connect this to your actual submission logic
  const handleSubmitProject = () => setIsSubmissionModalOpen(true);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleGetStarted = () => {
    openAuthModal('login');
  };

  // Handler to submit project to backend
  const handleProjectSubmit = async (project: any) => {
    try {
      await axiosInstance.post('/projects', project, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      setIsSubmissionModalOpen(false);
    } catch (error) {
      // Optionally show a toast or error message here
      setIsSubmissionModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        isLoggedIn={!!user}
        onAuthModalOpen={openAuthModal}
        onSubmitProject={handleSubmitProject}
      />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center space-y-8 py-16">
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">Welcome to Projectify</h1>
          <p className="text-gray-600 text-lg mb-8">Showcase your work, discover amazing projects, and connect with talented interns and early-career developers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-md font-semibold shadow"
                  onClick={handleSubmitProject}
                >
                  Submit Project
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-md font-semibold shadow"
                  onClick={() => navigate('/projects')}
                >
                  Explore Projects
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-md font-semibold shadow"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-md font-semibold shadow"
                  onClick={() => navigate('/projects')}
                >
                  Explore Projects
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              A Platform to showcase the incredible work of our intern community
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={() => {
          // Handle successful authentication
          setIsAuthModalOpen(false);
        }}
      />

      {/* Submission Modal for logged-in users */}
      {user && (
        <ProjectSubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          onSubmit={handleProjectSubmit}
        />
      )}
    </div>
  );
};

export default Home;