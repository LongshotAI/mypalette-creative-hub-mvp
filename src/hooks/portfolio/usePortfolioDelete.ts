
import { useState } from 'react';
import { toast } from 'sonner';
import * as portfolioApi from '@/services/api/portfolio.api';

export const usePortfolioDelete = (onSuccess?: () => void) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This will also delete all artworks in it.')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const response = await portfolioApi.deletePortfolio(portfolioId);
      
      if (response.status === 'success') {
        toast.success('Portfolio deleted successfully');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    deletePortfolio,
    deleteLoading
  };
};
