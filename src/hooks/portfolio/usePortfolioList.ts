
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Portfolio } from '@/types/portfolio';
import * as portfolioApi from '@/services/api/portfolio.api';

export const usePortfolioList = (userId: string | undefined) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserPortfolios();
    }
  }, [userId]);

  const loadUserPortfolios = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await portfolioApi.getUserPortfolios(userId);
      
      if (response.status === 'success' && response.data) {
        setPortfolios(response.data);
        
        if (response.data.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast.error('Failed to load your portfolios');
    } finally {
      setLoading(false);
    }
  };

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios
  };
};
