
import { useState } from 'react';
import { toast } from 'sonner';
import { Portfolio, PortfolioFormData } from '@/types/portfolio';
import * as portfolioApi from '@/services/api/portfolio.api';

const defaultFormState: PortfolioFormData = {
  name: '',
  description: '',
  template: 'grid',
  theme: 'default',
  is_public: true
};

export const usePortfolioForm = (userId: string | undefined, onSuccess?: () => void) => {
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioFormData>(defaultFormState);

  const createPortfolio = async () => {
    if (!userId) return;
    
    setFormSubmitting(true);
    
    try {
      const response = await portfolioApi.createPortfolio(userId, portfolioForm);
      
      if (response.status === 'success') {
        toast.success('Portfolio created successfully');
        setPortfolioFormOpen(false);
        resetForm();
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const updatePortfolio = async () => {
    if (!editingPortfolio) return;
    
    setFormSubmitting(true);
    
    try {
      const response = await portfolioApi.updatePortfolio(editingPortfolio.id, portfolioForm);
      
      if (response.status === 'success') {
        toast.success('Portfolio updated successfully');
        setPortfolioFormOpen(false);
        resetForm();
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const editPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      name: portfolio.name,
      description: portfolio.description,
      template: portfolio.template,
      theme: portfolio.theme || 'default',
      is_public: portfolio.is_public
    });
    setPortfolioFormOpen(true);
  };

  const resetForm = () => {
    setEditingPortfolio(null);
    setPortfolioForm(defaultFormState);
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
