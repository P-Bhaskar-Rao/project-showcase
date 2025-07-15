import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToLogin: () => void;
  email: string;
}

const EmailVerificationModal = ({
  isOpen,
  onClose,
  onContinueToLogin,
  email
}: EmailVerificationModalProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResendButton(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await axiosInstance.get(`/auth/check-verification?email=${encodeURIComponent(email)}`);
        if (res.data.isVerified) {
          setIsVerified(true);
          toast({
            title: "Email verified!",
            description: "You may now sign in."
          });

          // Automatically continue to login after success
          setTimeout(() => {
            onContinueToLogin();
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to check email verification:", error);
      }
    };

    if (isOpen && !isVerified) {
      const interval = setInterval(checkVerification, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isVerified, email, onContinueToLogin, toast]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await axiosInstance.post("/auth/resend-verification", { email });
      toast({
        title: "Verification email resent",
        description: "Please check your inbox again."
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error?.response?.data?.error || "Could not resend verification email.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
      setShowResendButton(false);
      setTimeout(() => setShowResendButton(true), 30000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {isVerified ? "Email Verified!" : "Check Your Email"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {isVerified ? (
                <CheckCircle className="h-16 w-16 text-emerald-500 animate-scale-in" />
              ) : (
                <Mail className="h-16 w-16 text-blue-500" />
              )}
            </div>

            {isVerified ? (
              <>
                <p className="text-lg font-medium text-gray-900">
                  Your email has been verified successfully!
                </p>
                <p className="text-gray-600">You can now sign in to your account.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900">
                  We've sent a verification link to:
                </p>
                <p className="text-emerald-600 font-medium break-all">{email}</p>
                <p className="text-gray-600 text-sm">
                  Click the link in your email to verify your account.
                </p>
              </>
            )}
          </div>

          {!isVerified && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Can't find the email?</strong> Check your spam folder or wait a few minutes.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {isVerified ? (
              <Button
                onClick={onContinueToLogin}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Continue to Login
              </Button>
            ) : (
              <>
                {showResendButton && (
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    variant="outline"
                    className="w-full h-11"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend verification email
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={onContinueToLogin}
                  variant="ghost"
                  className="w-full h-11"
                >
                  I'll verify later – Continue to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
