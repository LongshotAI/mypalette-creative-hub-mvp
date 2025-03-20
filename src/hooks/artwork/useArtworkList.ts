
import { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import { getPortfolioArtworks } from '@/services/api/artwork.api';
import { toast } from 'sonner';

export const useArtworkList = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPortfolioArtworks = async (
    portfolioId: string,
    sortOrder: 'newest' | 'oldest' | 'price_high' | 'price_low' = 'newest'
  ) => {
    setLoading(true);
    try {
      const response = await getPortfolioArtworks(portfolioId, sortOrder);
      
      if (response.error) {
        throw response.error;
      }
      
      setArtworks(response.data || []);
    } catch (error) {
      console.error('Error loading artworks:', error);
      toast.error('Failed to load portfolio artworks');
    } finally {
      setLoading(false);
    }
  };

  return {
    artworks,
    setArtworks,
    loading,
    loadPortfolioArtworks
  };
};
