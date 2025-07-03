import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // Import axios

const API_URL = import.meta.env.VITE_API_URL; // Define API_URL

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Implement actual forgot password logic
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: data.email });
      
      if (response.data.success) {
        setIsEmailSent(true);
        setSentEmail(data.email);
        toast({
          title: "Reset link sent",
          description: response.data.message || "If an account exists, a reset link will be sent to your email."
        });
      }
    } catch (error: any) {
      console.error("Forgot password request failed:", error);
      const message = error.response?.data?.error || "Failed to send reset link. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      setIsEmailSent(false); // Ensure form is visible again on error
    }
  };

  const handleReset = () => {
    setIsEmailSent(false);
    setSentEmail("");
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {isEmailSent ? "Check Your Email" : "Forgot Password?"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isEmailSent ? (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-16 w-16 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Password reset link sent!
                  </p>
                  <p className="text-gray-600">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-emerald-600 font-medium break-all">
                    {sentEmail}
                  </p>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  If an account exists with this email, you will receive a reset link within a few minutes. 
                  Check your spam folder if you don't see it.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  onClick={onBackToLogin}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Back to Login
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="w-full h-11"
                >
                  Send Another Reset Link
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                  onClick={onBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
