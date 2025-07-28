
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  getTotalFavorites: () => number;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    // Return a default context that doesn't do anything if not in provider
    return {
      favorites: [],
      addToFavorites: async () => {},
      removeFromFavorites: async () => {},
      isFavorite: () => false,
      getTotalFavorites: () => 0,
      loading: false
    };
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data?.map(fav => fav.product_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: string) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add favorites',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) throw error;

      setFavorites(prev => [...prev, productId]);
      toast({
        title: 'Added to favorites',
        description: 'Product has been added to your favorites',
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to favorites',
        variant: 'destructive',
      });
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== productId));
      toast({
        title: 'Removed from favorites',
        description: 'Product has been removed from your favorites',
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const getTotalFavorites = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      getTotalFavorites,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
