
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Portfolio } from '@/types/portfolio';
import { toast } from 'sonner';

export const usePortfolioList = (userId: string | undefined) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const loadUserPortfolios = async () => {
    if (!userId) {
      console.warn('Cannot load portfolios without a userId');
      setLoading(false);
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
      setPortfolios(data || []);
      
      if (data && data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0].id);
      } else if (data && data.length === 0) {
        setSelectedPortfolio(null);
      }
    } catch (error: any) {
      console.error('Error loading portfolios:', error);
      toast.error('Failed to load your portfolios: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserPortfolios();
    } else {
      setLoading(false);
      setPortfolios([]);
      setSelectedPortfolio(null);
    }
  }, [userId]);

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios
  };
};
