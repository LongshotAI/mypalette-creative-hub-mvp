
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Portfolio } from '@/types/portfolio';
import { toast } from 'sonner';

export const usePortfolioList = (userId: string | undefined) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const loadUserPortfolios = useCallback(async () => {
    if (!userId) {
      console.warn('Cannot load portfolios without a userId');
      setLoading(false);
      setIsLoaded(true);
      return;
    }
    
    if (loading) {
      console.warn('Already loading portfolios, skipping duplicate request');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching portfolios for user:', userId);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading portfolios:', error);
        throw error;
      }
      
      console.log('Portfolios loaded:', data?.length || 0);
      const portfolioList = data || [];
      setPortfolios(portfolioList);
      
      if (portfolioList.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioList[0].id);
      } else if (portfolioList.length === 0) {
        setSelectedPortfolio(null);
      }
    } catch (error: any) {
      console.error('Error loading portfolios:', error);
      toast.error('Failed to load your portfolios: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  }, [userId, loading, selectedPortfolio]);

  useEffect(() => {
    if (userId && !isLoaded) {
      loadUserPortfolios();
    } else if (!userId) {
      setLoading(false);
      setPortfolios([]);
      setSelectedPortfolio(null);
      setIsLoaded(true);
    }
  }, [userId, loadUserPortfolios, isLoaded]);

  // Reset loaded state when userId changes
  useEffect(() => {
    setIsLoaded(false);
  }, [userId]);

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios
  };
};
