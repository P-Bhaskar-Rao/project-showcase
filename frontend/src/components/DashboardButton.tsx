
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardButtonProps {
  isLoggedIn: boolean;
}

const DashboardButton = ({ isLoggedIn }: DashboardButtonProps) => {
  const navigate = useNavigate();

  if (!isLoggedIn) return null;

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <Button
      variant="outline"
      onClick={handleDashboardClick}
      className="flex items-center gap-2"
    >
      <LayoutDashboard className="h-4 w-4" />
      Dashboard
    </Button>
  );
};

export default DashboardButton;
