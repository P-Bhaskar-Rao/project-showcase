
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle, XCircle, Key, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface PasswordStrength {
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const password = watch("password", "");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // TODO: Validate token with backend
    const validateToken = async () => {
      console.log("Validating token:", token);
      // Simulate token validation
      setTimeout(() => {
        // Mock validation - in real app, check with backend
        if (token === 'expired') {
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      }, 1000);
    };

    validateToken();
  }, [token]);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    return {
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  const onSubmit = async (data: ResetPasswordFormData) => {
    // TODO: Implement actual password reset logic
    console.log("Resetting password for token:", token);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSuccess(true);
    toast({
      title: "Password reset successful!",
      description: "Your password has been updated. You can now sign in with your new password."
    });
    
    // Redirect to home after success
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-emerald-600' : 'text-gray-500'}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Invalid Reset Link
              </CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertDescription className="text-red-800">
                  Password reset links expire after 24 hours for security reasons. 
                  Please request a new reset link if you still need to change your password.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="animate-scale-in">
                  <CheckCircle className="h-16 w-16 text-emerald-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </CardTitle>
              <CardDescription>
                Your password has been updated successfully.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert className="border-emerald-200 bg-emerald-50 mb-6">
                <AlertDescription className="text-emerald-800">
                  You can now sign in to your account using your new password. 
                  You will be redirected to the home page shortly.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Continue to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <Key className="h-16 w-16 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </CardTitle>
            {email && (
              <CardDescription className="text-base">
                for {email}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                    <div className="grid grid-cols-1 gap-1">
                      <PasswordRequirement met={passwordStrength.hasLength} text="At least 8 characters" />
                      <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                      <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                      <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                      <PasswordRequirement met={passwordStrength.hasSpecial} text="One special character" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...register("confirmPassword")}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
