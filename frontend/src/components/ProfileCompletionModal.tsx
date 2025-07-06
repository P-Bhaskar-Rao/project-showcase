import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, AlertCircle } from "lucide-react";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

const ProfileCompletionModal = ({ 
  isOpen, 
  onClose, 
  onEditProfile
}: ProfileCompletionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-emerald-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Complete Your Profile
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <User className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              Profile Incomplete
            </h3>
            <p className="text-gray-600 mb-4">
              Please complete your profile before submitting a project. This ensures your project showcases your professional background.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onEditProfile}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionModal; 