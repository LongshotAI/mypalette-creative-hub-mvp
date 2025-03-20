
import { useState, useEffect } from 'react';
import { supabase, getUserPortfolios } from '@/lib/supabase';
import { Portfolio, PortfolioFormData } from '@/types/portfolio';
import { toast } from 'sonner';

export const usePortfolios = (userId: string) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (userId) {
      loadUserPortfolios();
    }
  }, [userId]);

  const loadUserPortfolios = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const portfolioData = await getUserPortfolios(userId);
      setPortfolios(portfolioData);
      
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData[0].id);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast.error('Failed to load your portfolios');
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    if (!userId) return;
    
    setFormSubmitting(true);
    
    try {
      const newPortfolio = {
        user_id: userId,
        name: portfolioForm.name,
        description: portfolioForm.description,
        template: portfolioForm.template,
        theme: portfolioForm.theme,
        is_public: portfolioForm.is_public
      };
      
      let { data, error } = await supabase
        .from('portfolios')
        .insert([newPortfolio])
        .select();
      
      if (error) throw error;
      
      toast.success('Portfolio created successfully');
      setPortfolioFormOpen(false);
      
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        theme: 'default',
        is_public: true
      });
      
      await loadUserPortfolios();
      
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0].id);
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setFormSubmitting(false);
    }
  };

  const updatePortfolio = async () => {
    if (!editingPortfolio) return;
    
    setFormSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: portfolioForm.name,
          description: portfolioForm.description,
          template: portfolioForm.template,
          theme: portfolioForm.theme,
          is_public: portfolioForm.is_public
        })
        .eq('id', editingPortfolio.id);
      
      if (error) throw error;
      
      toast.success('Portfolio updated successfully');
      setPortfolioFormOpen(false);
      
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        theme: 'default',
        is_public: true
      });
      
      setEditingPortfolio(null);
      
      await loadUserPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio');
    } finally {
      setFormSubmitting(false);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This will also delete all artworks in it.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
      
      toast.success('Portfolio deleted successfully');
      
      await loadUserPortfolios();
      
      if (selectedPortfolio === portfolioId) {
        if (portfolios.length > 0) {
          setSelectedPortfolio(portfolios[0].id);
        } else {
          setSelectedPortfolio(null);
        }
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio');
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

  const resetPortfolioForm = () => {
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
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    portfolioFormOpen,
    setPortfolioFormOpen,
    formSubmitting,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    loadUserPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    editPortfolio,
    resetPortfolioForm
  };
};
