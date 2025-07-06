import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode from the library

// Define the expected structure of your JWT payload
interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  isVerified: boolean;
  avatar?: string | null;
  oauthProvider?: 'google' | 'github' | null;
  // Add any other properties your JWT payload might contain
}

const AuthSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { toast } = useToast();

  useEffect(() => {
    const accessToken = searchParams.get('token'); // Get the access token from URL
    
    if (accessToken) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(accessToken); // Decode using jwt-decode

        // Ensure essential user data is present in the decoded token
        if (decodedToken && decodedToken.userId && decodedToken.name && decodedToken.email) {
          const actualUser = {
            id: decodedToken.userId,
            name: decodedToken.name,
            email: decodedToken.email,
            isVerified: decodedToken.isVerified,
            avatar: decodedToken.avatar || null,
            oauthProvider: decodedToken.oauthProvider || null,
          };

          setAuth(actualUser, accessToken); // Update Zustand store with actual data
          toast({
            title: "Login Successful!",
            description: `Welcome, ${actualUser.name}!`,
          });
          navigate('/'); // Redirect to home page
        } else {
          console.error("Decoded token missing required user data:", decodedToken);
          toast({
            title: "Login Failed",
            description: "OAuth token invalid or missing user data.",
            variant: "destructive",
          });
          navigate('/'); // Redirect to home page instead of non-existent login page
        }
      } catch (error) {
        console.error("Error decoding JWT:", error);
        toast({
          title: "Login Failed",
          description: "Invalid access token received or decoding failed.",
          variant: "destructive",
        });
        navigate('/'); // Redirect to home page instead of non-existent login page
      }
    } else {
      toast({
        title: "Login Failed",
        description: "No access token found in redirect.",
        variant: "destructive",
      });
      navigate('/'); // Redirect to home page instead of non-existent login page
    }
  }, [searchParams, navigate, setAuth, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-gray-600">Processing OAuth login...</p>
    </div>
  );
};

export default AuthSuccessHandler;
