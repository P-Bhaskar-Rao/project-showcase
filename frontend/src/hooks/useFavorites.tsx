import { useState } from "react";

// Favorites feature is disabled for now
export const useFavorites = () => {
  return {
    favorites: new Set(),
    loading: false,
    toggleFavorite: () => {},
  };
};
