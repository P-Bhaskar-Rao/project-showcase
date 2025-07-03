
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToLogin: () => void;
  email: string;
}

const EmailVerificationModal = ({ isOpen, onClose, onContinueToLogin, email }: EmailVerificationModalProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    // Show resend button after 30 seconds
    const timer = setTimeout(() => {
      setShowResendButton(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Check for verification status (simulate checking)
  useEffect(() => {
    const checkVerification = () => {
      // TODO: Implement actual verification checking
      // This would poll your backend to check if email is verified
      console.log("Checking verification status...");
    };

    if (isOpen && !isVerified) {
      const interval = setInterval(checkVerification, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isVerified]);

  const handleResendEmail = async () => {
    setIsResending(true);
    // TODO: Implement resend verification email
    console.log("Resending verification email to:", email);
    
    setTimeout(() => {
      setIsResending(false);
      setShowResendButton(false);
      // Reset timer for showing resend button again
      setTimeout(() => setShowResendButton(true), 30000);
    }, 1000);
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    // Auto-close after showing success animation
    setTimeout(() => {
      onContinueToLogin();
    }, 2000);
  };

  // Simulate receiving verification (for demo purposes)
  const simulateVerification = () => {
    handleVerificationSuccess();
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
                <div className="animate-scale-in">
                  <CheckCircle className="h-16 w-16 text-emerald-500" />
                </div>
              ) : (
                <Mail className="h-16 w-16 text-blue-500" />
              )}
            </div>
            
            {isVerified ? (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Your email has been verified successfully!
                </p>
                <p className="text-gray-600">
                  You can now sign in to your account.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  We've sent a verification link to:
                </p>
                <p className="text-emerald-600 font-medium break-all">
                  {email}
                </p>
                <p className="text-gray-600 text-sm">
                  Click the link in your email to verify your account.
                </p>
              </div>
            )}
          </div>

          {!isVerified && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Can't find the email?</strong> Check your spam folder or wait a few minutes for it to arrive.
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
                
                {/* Demo button - remove in production */}
                <Button 
                  onClick={simulateVerification}
                  variant="outline"
                  className="w-full h-11 border-dashed"
                >
                  Simulate Verification (Demo)
                </Button>
                
                <Button 
                  onClick={onContinueToLogin}
                  variant="ghost"
                  className="w-full h-11"
                >
                  I'll verify later - Continue to Login
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
