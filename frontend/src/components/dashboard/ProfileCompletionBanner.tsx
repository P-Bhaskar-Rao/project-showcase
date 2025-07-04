
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCompletionBannerProps {
  onEditProfile: () => void;
}

const ProfileCompletionBanner = ({ onEditProfile }: ProfileCompletionBannerProps) => {
  return (
    <Card className="border-orange-200 bg-orange-50 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-orange-800 mb-1">Complete Your Profile</h4>
            <p className="text-sm text-orange-700 mb-3">
              Please complete your profile information before submitting projects. Your name, bio, and GitHub profile will be used as author details for your submissions.
            </p>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={onEditProfile}
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionBanner;
