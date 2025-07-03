import AuthController from "./auth/AuthController";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
  onAuthSuccess?: () => void;
}

const AuthModal = ({ isOpen, onClose, mode, onModeChange, onAuthSuccess }: AuthModalProps) => {
  return (
    <AuthController
      initialMode={mode}
      isOpen={isOpen}
      onClose={onClose}
      onAuthSuccess={onAuthSuccess}
    />
  );
};

export default AuthModal;
