
import { useState } from 'react';
import { Artwork, ArtworkFormData } from '@/types/portfolio';
import { toast } from 'sonner';
import { createArtwork, updateArtwork } from '@/services/api/artwork.api';

export const useArtworkForm = (onArtworkUpdated: (portfolioId: string) => void) => {
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  
  const [artworkForm, setArtworkForm] = useState<ArtworkFormData>({
    title: '',
    description: '',
    image_url: '',
    price: '',
    currency: 'USD',
    for_sale: false
  });

  const handleCreateArtwork = async (portfolioId: string) => {
    if (!portfolioId) return;
    
    setFormSubmitting(true);
    
    try {
      const response = await createArtwork(portfolioId, artworkForm);
      
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      
      toast.success('Artwork added successfully');
      setArtworkFormOpen(false);
      resetArtworkForm();
      
      // Reload the artwork list
      onArtworkUpdated(portfolioId);
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error('Failed to add artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateArtwork = async (portfolioId: string) => {
    if (!editingArtwork || !portfolioId) return;
    
    setFormSubmitting(true);
    
    try {
      const response = await updateArtwork(editingArtwork.id, artworkForm);
      
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      
      toast.success('Artwork updated successfully');
      setArtworkFormOpen(false);
      resetArtworkForm();
      
      // Reload the artwork list
      onArtworkUpdated(portfolioId);
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const editArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setArtworkForm({
      title: artwork.title,
      description: artwork.description,
      image_url: artwork.image_url,
      price: artwork.price?.toString() || '',
      currency: artwork.currency,
      for_sale: artwork.for_sale
    });
    setArtworkFormOpen(true);
  };

  const resetArtworkForm = () => {
    setEditingArtwork(null);
    setArtworkForm({
      title: '',
      description: '',
      image_url: '',
      price: '',
      currency: 'USD',
      for_sale: false
    });
  };

  return {
    artworkFormOpen,
    setArtworkFormOpen,
    formSubmitting,
    editingArtwork,
    artworkForm,
    setArtworkForm,
    handleCreateArtwork,
    handleUpdateArtwork,
    editArtwork,
    resetArtworkForm
  };
};
