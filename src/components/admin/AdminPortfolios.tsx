
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminPortfoliosList from './portfolios/AdminPortfoliosList';

interface PortfolioWithOwner {
  id: string;
  name: string;
  description: string;
  template: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
  artwork_count: number;
}

const AdminPortfolios = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        // Get all portfolios with join to profiles for owner information
        const { data, error } = await supabase
          .from('portfolios')
          .select(`
            *,
            profiles:user_id (
              full_name,
              username,
              email
            )
          `);
        
        if (error) {
          throw error;
        }

        // Get artwork count for each portfolio
        const portfoliosWithCounts = await Promise.all(
          data.map(async (portfolio) => {
            const { count, error: countError } = await supabase
              .from('artworks')
              .select('*', { count: 'exact', head: true })
              .eq('portfolio_id', portfolio.id);
            
            return {
              ...portfolio,
              owner_name: portfolio.profiles?.full_name || portfolio.profiles?.username || 'Unknown',
              owner_email: portfolio.profiles?.email || 'Unknown',
              artwork_count: count || 0
            };
          })
        );
        
        setPortfolios(portfoliosWithCounts);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        toast.error('Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDeletePortfolio = async (id: string) => {
    try {
      setLoading(true);
      
      // First delete all artworks in the portfolio
      const { error: artworksError } = await supabase
        .from('artworks')
        .delete()
        .eq('portfolio_id', id);
      
      if (artworksError) {
        throw artworksError;
      }
      
      // Then delete the portfolio
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPortfolios(portfolios.filter(p => p.id !== id));
      toast.success('Portfolio deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio');
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      portfolio.name.toLowerCase().includes(searchLower) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(searchLower)) ||
      portfolio.owner_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Portfolios</CardTitle>
        <CardDescription>
          View and manage all portfolios on the platform
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search portfolios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <AdminPortfoliosList 
          portfolios={filteredPortfolios} 
          loading={loading} 
          onDeletePortfolio={handleDeletePortfolio} 
        />
      </CardContent>
    </Card>
  );
};

export default AdminPortfolios;
