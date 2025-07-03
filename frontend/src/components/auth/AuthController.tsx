import { useState, useEffect } from "react";
import SignupModal from "./SignupModal";
import EmailVerificationModal from "./EmailVerificationModal";
import LoginModal from "./LoginModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { useAuthStore } from "@/store/useAuthStore"; // ✅ Import Zustand store

interface AuthControllerProps {
  initialMode?: "login" | "signup";
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

type AuthMode = "signup" | "email-verification" | "login" | "forgot-password";

const AuthController = ({
  initialMode = "login",
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthControllerProps) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);
  const [verificationEmail, setVerificationEmail] = useState("");

  const user = useAuthStore((state) => state.user); // ✅ Access user from Zustand

  const handleClose = () => {
    setCurrentMode(initialMode);
    setVerificationEmail("");
    onClose();
  };

  const handleSignupSuccess = (email: string) => {
    setVerificationEmail(email);
    setCurrentMode("email-verification");
  };

  const handleVerificationComplete = () => {
    setCurrentMode("login");
  };

  // ✅ Auto-close when user logs in
  useEffect(() => {
    if (user && isOpen) {
      handleClose();
    }
  }, [user, isOpen]);

  const renderCurrentModal = () => {
    switch (currentMode) {
      case "signup":
        return (
          <SignupModal
            isOpen={isOpen}
            onClose={handleClose}
            onSwitchToLogin={() => setCurrentMode("login")}
            onSignupSuccess={handleSignupSuccess}
          />
        );

      case "email-verification":
        return (
          <EmailVerificationModal
            isOpen={isOpen}
            onClose={handleClose}
            onContinueToLogin={handleVerificationComplete}
            email={verificationEmail}
          />
        );

      case "login":
        return (
          <LoginModal
            isOpen={isOpen}
            onClose={handleClose}
            onSwitchToSignup={() => setCurrentMode("signup")}
            onSwitchToForgotPassword={() => setCurrentMode("forgot-password")}
            onLoginSuccess={onAuthSuccess}
          />
        );

      case "forgot-password":
        return (
          <ForgotPasswordModal
            isOpen={isOpen}
            onClose={handleClose}
            onBackToLogin={() => setCurrentMode("login")}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentModal();
};

export default AuthController;
