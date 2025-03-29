
import { usePortfolioList } from './usePortfolioList';
import { usePortfolioForm } from './usePortfolioForm';
import { usePortfolioDelete } from './usePortfolioDelete';
import { useCallback, useEffect, useRef } from 'react';

export const usePortfolios = (userId: string | undefined) => {
  const hasLoggedWarning = useRef(false);
  
  if (!userId && !hasLoggedWarning.current) {
    console.warn('usePortfolios called without userId, some functionality may be limited');
    hasLoggedWarning.current = true;
  }
  
  const {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios
  } = usePortfolioList(userId);

  const {
    portfolioFormOpen,
    setPortfolioFormOpen,
    formSubmitting,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    createPortfolio,
    updatePortfolio,
    editPortfolio,
    resetForm: resetPortfolioForm
  } = usePortfolioForm(userId, loadUserPortfolios);

  const handlePortfolioDeleted = useCallback(() => {
    loadUserPortfolios();
    
    if (portfolios.length > 1) {
      // Find a portfolio that's not the one being deleted
      const nextPortfolio = portfolios.find(p => p.id !== selectedPortfolio);
      if (nextPortfolio) {
        setSelectedPortfolio(nextPortfolio.id);
      } else {
        setSelectedPortfolio(null);
      }
    } else {
      setSelectedPortfolio(null);
    }
  }, [portfolios, selectedPortfolio, setSelectedPortfolio, loadUserPortfolios]);

  const {
    deletePortfolio,
    deleteLoading
  } = usePortfolioDelete(handlePortfolioDeleted);

  return {
    // From usePortfolioList
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios,
    
    // From usePortfolioForm
    portfolioFormOpen,
    setPortfolioFormOpen,
    formSubmitting,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    createPortfolio,
    updatePortfolio,
    editPortfolio,
    resetPortfolioForm,
    
    // From usePortfolioDelete
    deletePortfolio,
    deleteLoading
  };
};
