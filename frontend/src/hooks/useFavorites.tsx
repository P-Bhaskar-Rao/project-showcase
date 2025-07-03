
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = (isLoggedIn: boolean, openAuthModal: (mode: 'login' | 'signup') => void) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleFavorite = (projectId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add projects to favorites.",
        variant: "destructive",
      });
      openAuthModal('login');
      return;
    }
    
    const newFavorites = new Set(favorites);
    if (newFavorites.has(projectId)) {
      newFavorites.delete(projectId);
      toast({
        title: "Removed from favorites",
        description: "Project removed from your favorites.",
      });
    } else {
      newFavorites.add(projectId);
      toast({
        title: "Added to favorites",
        description: "Project added to your favorites!",
      });
    }
    setFavorites(newFavorites);
  };

  return {
    favorites,
    toggleFavorite
  };
};
