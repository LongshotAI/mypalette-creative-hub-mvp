
import { useState } from 'react';
import { PortfolioFormData, Portfolio } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePortfolioForm = (
  userId: string | undefined, 
  onSuccess: () => void
) => {
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioFormData>({
    name: '',
    description: '',
    template: 'grid',
    theme: 'default',
    is_public: true
  });

  const createPortfolio = async () => {
    if (!userId) {
      toast.error('You must be logged in to create a portfolio');
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      console.log('Creating portfolio:', portfolioForm);
      const newPortfolio = {
        user_id: userId,
        name: portfolioForm.name,
        description: portfolioForm.description,
        template: portfolioForm.template,
        theme: portfolioForm.theme,
        is_public: portfolioForm.is_public
      };
      
      const { data, error } = await supabase
        .from('portfolios')
        .insert([newPortfolio])
        .select();
      
      if (error) {
        console.error('Error creating portfolio:', error);
        throw error;
      }
      
      console.log('Portfolio created:', data);
      toast.success('Portfolio created successfully');
      setPortfolioFormOpen(false);
      
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio: ' + (error.message || 'Unknown error'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const updatePortfolio = async () => {
    if (!editingPortfolio) {
      toast.error('No portfolio selected for editing');
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      console.log('Updating portfolio:', editingPortfolio.id, portfolioForm);
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          name: portfolioForm.name,
          description: portfolioForm.description,
          template: portfolioForm.template,
          theme: portfolioForm.theme,
          is_public: portfolioForm.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPortfolio.id)
        .select();
      
      if (error) {
        console.error('Error updating portfolio:', error);
        throw error;
      }
      
      console.log('Portfolio updated:', data);
      toast.success('Portfolio updated successfully');
      setPortfolioFormOpen(false);
      
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio: ' + (error.message || 'Unknown error'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const editPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      name: portfolio.name,
      description: portfolio.description || '',
      template: portfolio.template,
      theme: portfolio.theme || 'default',
      is_public: portfolio.is_public
    });
    setPortfolioFormOpen(true);
  };

  const resetForm = () => {
    setEditingPortfolio(null);
    setPortfolioForm({
      name: '',
      description: '',
      template: 'grid',
      theme: 'default',
      is_public: true
    });
  };

  return {
    portfolioFormOpen,
    setPortfolioFormOpen,
    formSubmitting,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    createPortfolio,
    updatePortfolio,
    editPortfolio,
    resetForm
  };
};
