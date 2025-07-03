import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal = ({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onLoginSuccess
}: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth); 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        withCredentials: true
      });

      if (response.data.success) {
        const { user, accessToken } = response.data;

        // ✅ Store user and token in Zustand
        setAuth(user, accessToken);

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });

        onLoginSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.error || "Invalid email or password.",
        variant: "destructive"
      });
    }
  };

  const handleSocialAuth = (provider: "Google" | "GitHub") => {
    // Corrected: Use API_URL directly, then append '/auth'
    // If API_URL is http://localhost:5000/api, then this becomes http://localhost:5000/api/auth
    const authBaseUrl = API_URL; 
    console.log(`Initiating OAuth from LoginModal with full URL: ${authBaseUrl}/auth/${provider.toLowerCase()}`); 
    window.location.href = provider === "Google" ? `${authBaseUrl}/auth/google` : `${authBaseUrl}/auth/github`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Welcome Back
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => handleSocialAuth("Google")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => handleSocialAuth("GitHub")}
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                onClick={onSwitchToForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                onClick={onSwitchToSignup}
              >
                Sign up
              </button>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
