
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
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      console.log('Fetching all portfolios for admin...');
      
      // Get all portfolios 
      const { data: portfoliosData, error } = await supabase
        .from('portfolios')
        .select('*');
      
      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      console.log(`Found ${portfoliosData?.length || 0} portfolios`);

      // Get owner information for each portfolio
      const portfoliosWithOwners = await Promise.all(
        portfoliosData.map(async (portfolio) => {
          // Get owner information
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', portfolio.user_id)
            .single();
          
          if (profileError) {
            console.warn(`Couldn't fetch owner for portfolio ${portfolio.id}:`, profileError);
          }
          
          // Get artwork count
          const { count, error: countError } = await supabase
            .from('artworks')
            .select('*', { count: 'exact', head: true })
            .eq('portfolio_id', portfolio.id);
          
          if (countError) {
            console.warn(`Couldn't fetch artwork count for portfolio ${portfolio.id}:`, countError);
          }
          
          return {
            ...portfolio,
            owner_name: profileData?.full_name || 'Unknown User',
            owner_email: profileData?.email || 'No email',
            artwork_count: count || 0
          };
        })
      );
      
      console.log('Fetched portfolios with owner data:', portfoliosWithOwners);
      setPortfolios(portfoliosWithOwners);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error('Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      // First delete all artworks in the portfolio
      console.log('Deleting artworks for portfolio:', id);
      const { error: artworksError } = await supabase
        .from('artworks')
        .delete()
        .eq('portfolio_id', id);
      
      if (artworksError) {
        console.error('Error deleting portfolio artworks:', artworksError);
        throw artworksError;
      }
      
      // Then delete the portfolio
      console.log('Deleting portfolio:', id);
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting portfolio:', error);
        throw error;
      }
      
      console.log('Portfolio deleted successfully');
      toast.success('Portfolio deleted successfully');
      setPortfolios(portfolios.filter(p => p.id !== id));
      
    } catch (error: any) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPortfolios();
    setIsRefreshing(false);
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      portfolio.name?.toLowerCase().includes(searchLower) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(searchLower)) ||
      portfolio.owner_name?.toLowerCase().includes(searchLower) ||
      portfolio.owner_email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Portfolios</CardTitle>
            <CardDescription>
              View and manage all portfolios on the platform
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search portfolios by name, description or owner..."
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
          onRefetch={fetchPortfolios}
        />
      </CardContent>
    </Card>
  );
};

export default AdminPortfolios;
