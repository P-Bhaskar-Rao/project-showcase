
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Heart, Calendar, User } from "lucide-react";

interface QuickStatsProps {
  userProjectsCount: number;
  favoriteProjectsCount: number;
  joinDate: string;
  isProfileComplete: boolean;
}

const QuickStats = ({ userProjectsCount, favoriteProjectsCount, joinDate, isProfileComplete }: QuickStatsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Code className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <span className="text-xl font-bold text-blue-600">{userProjectsCount}</span>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Favorites</span>
            </div>
            <span className="text-xl font-bold text-red-600">{favoriteProjectsCount}</span>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Member Since</span>
            </div>
            <span className="text-sm font-semibold text-green-600">{joinDate}</span>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Profile</span>
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {isProfileComplete ? 'Complete' : 'Incomplete'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
