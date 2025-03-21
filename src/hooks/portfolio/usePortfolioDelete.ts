
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePortfolioDelete = (onSuccess: () => void) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This will also delete all artworks in it.')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      console.log('Deleting portfolio:', portfolioId);
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) {
        console.error('Error deleting portfolio:', error);
        throw error;
      }
      
      console.log('Portfolio deleted successfully');
      toast.success('Portfolio deleted successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    deletePortfolio,
    deleteLoading
  };
};
