
import { usePortfolioList } from './usePortfolioList';
import { usePortfolioForm } from './usePortfolioForm';
import { usePortfolioDelete } from './usePortfolioDelete';

export const usePortfolios = (userId: string | undefined) => {
  if (!userId) {
    console.warn('usePortfolios called without userId, some functionality may be limited');
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

  const {
    deletePortfolio,
    deleteLoading
  } = usePortfolioDelete(() => {
    loadUserPortfolios();
    
    if (portfolios.length > 0) {
      setSelectedPortfolio(portfolios[0].id);
    } else {
      setSelectedPortfolio(null);
    }
  });

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
