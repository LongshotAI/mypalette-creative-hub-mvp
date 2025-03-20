
import { useArtworkList } from './useArtworkList';
import { useArtworkForm } from './useArtworkForm';
import { useArtworkUpload } from './useArtworkUpload';
import { useArtworkDelete } from './useArtworkDelete';
import { useArtworkSort } from './useArtworkSort';

export const useArtworks = (userId: string | undefined) => {
  const { sortOrder, setSortOrder } = useArtworkSort();

  const {
    artworks,
    setArtworks,
    loading,
    loadPortfolioArtworks
  } = useArtworkList();

  const {
    handleArtworkImageUpload,
    imageUploading
  } = useArtworkUpload();

  const {
    artworkFormOpen,
    setArtworkFormOpen,
    formSubmitting,
    editingArtwork,
    artworkForm,
    setArtworkForm,
    createArtwork,
    updateArtwork,
    editArtwork,
    resetArtworkForm
  } = useArtworkForm(userId, loadPortfolioArtworks);

  const {
    deleteLoading,
    handleDeleteArtwork
  } = useArtworkDelete(loadPortfolioArtworks);

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
    handleArtworkImageUpload,
    imageUploading,
    
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
    handleDeleteArtwork
  };
};
