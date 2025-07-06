import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ProfileCompletionBannerProps {
  onEditProfile: () => void;
}

const ProfileCompletionBanner = ({ onEditProfile }: ProfileCompletionBannerProps) => {
  return (
    <Card className="border-orange-200 bg-orange-50 mb-6 rounded-xl shadow-sm">
      <CardContent className="pt-6 pb-4 px-6 flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full flex-shrink-0">
          <AlertCircle className="text-white h-6 w-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-orange-800 mb-1">Complete Your Profile</h4>
          <p className="text-sm text-orange-700 mb-3">
            Please complete your profile information before submitting projects. Your name, bio, and GitHub profile will be used as author details for your submissions.
          </p>
        </div>
        <Button 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700 rounded-md font-semibold px-4 py-2"
          onClick={onEditProfile}
        >
          Complete Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionBanner;
