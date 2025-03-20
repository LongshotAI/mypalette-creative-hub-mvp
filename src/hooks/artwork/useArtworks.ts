
import { useEffect } from 'react';
import { Artwork } from '@/types/portfolio';
import { useArtworkList } from './useArtworkList';
import { useArtworkForm } from './useArtworkForm';
import { useArtworkUpload } from './useArtworkUpload';
import { useArtworkSort } from './useArtworkSort';
import { useArtworkDelete } from './useArtworkDelete';

export const useArtworks = (userId: string | undefined) => {
  const {
    artworks,
    setArtworks,
    loading,
    loadPortfolioArtworks
  } = useArtworkList();

  const {
    sortOrder,
    setSortOrder
  } = useArtworkSort();

  const {
    imageUploading,
    handleArtworkImageUpload
  } = useArtworkUpload();

  const {
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
  } = useArtworkForm((portfolioId) => loadPortfolioArtworks(portfolioId, sortOrder));

  const {
    deleteLoading,
    handleDeleteArtwork
  } = useArtworkDelete((portfolioId) => loadPortfolioArtworks(portfolioId, sortOrder));

  // Custom wrapper functions that maintain the original hook API
  const createArtwork = (portfolioId: string) => {
    handleCreateArtwork(portfolioId);
  };

  const updateArtwork = (portfolioId: string) => {
    handleUpdateArtwork(portfolioId);
  };

  const deleteArtwork = (artworkId: string, portfolioId: string) => {
    handleDeleteArtwork(artworkId, portfolioId);
  };

  // Custom wrapper for the image upload that matches the original API
  const handleArtworkImageUploadWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userId) {
      handleArtworkImageUpload(e, userId, (imageUrl) => {
        setArtworkForm({
          ...artworkForm,
          image_url: imageUrl
        });
      });
    }
  };

  return {
    // From useArtworkList
    artworks,
    setArtworks,
    loading,
    loadPortfolioArtworks,
    
    // From useArtworkSort
    sortOrder,
    setSortOrder,
    
    // From useArtworkUpload
    imageUploading,
    handleArtworkImageUpload: handleArtworkImageUploadWrapper,
    
    // From useArtworkForm
    artworkFormOpen,
    setArtworkFormOpen,
    formSubmitting,
    editingArtwork,
    artworkForm,
    setArtworkForm,
    createArtwork,
    updateArtwork,
    editArtwork,
    resetArtworkForm,
    
    // From useArtworkDelete
    deleteLoading,
    deleteArtwork
  };
};
