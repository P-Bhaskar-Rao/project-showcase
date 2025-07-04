
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  profilePicture?: string;
}

interface ProfilePictureSectionProps {
  profile: UserProfile;
  editedProfile: UserProfile;
  setEditedProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isEditing: boolean;
}

const ProfilePictureSection = ({ profile, editedProfile, setEditedProfile, isEditing }: ProfilePictureSectionProps) => {
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProfile(prev => ({
          ...prev,
          profilePicture: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xl sm:text-2xl overflow-hidden">
          {editedProfile.profilePicture ? (
            <img 
              src={editedProfile.profilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            editedProfile.name.charAt(0).toUpperCase()
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
            <Camera className="h-4 w-4 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
          </label>
        )}
      </div>
      <div className="flex-1 w-full text-center sm:text-left">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-sm text-gray-500">Joined {profile.joinDate}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureSection;
