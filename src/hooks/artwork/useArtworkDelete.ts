
import { useState } from 'react';
import { deleteArtwork } from '@/services/api/artwork.api';
import { toast } from 'sonner';

export const useArtworkDelete = (onArtworkDeleted: (portfolioId: string) => void) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteArtwork = async (artworkId: string, portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const response = await deleteArtwork(artworkId);
      
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      
      toast.success('Artwork deleted successfully');
      
      // Reload the artwork list
      onArtworkDeleted(portfolioId);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    deleteLoading,
    handleDeleteArtwork
  };
};
