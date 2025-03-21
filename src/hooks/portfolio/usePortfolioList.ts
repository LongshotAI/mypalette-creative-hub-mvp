
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Portfolio } from '@/types/portfolio';
import { toast } from 'sonner';

export const usePortfolioList = (userId: string | undefined) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const loadUserPortfolios = async () => {
    if (!userId) {
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
      
      console.log('Portfolios loaded:', data);
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
    loadUserPortfolios();
  }, [userId]);

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    loadUserPortfolios
  };
};
