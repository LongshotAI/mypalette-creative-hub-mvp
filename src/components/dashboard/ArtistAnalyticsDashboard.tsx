
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, ShoppingCart, TrendingUp, Share2 } from 'lucide-react';
import { Artwork, Portfolio } from '@/types/portfolio';

interface AnalyticsData {
  totalViews: number;
  artworkViews: {
    artworkId: string;
    artworkTitle: string;
    views: number;
  }[];
  totalSales: number;
  salesAmount: number;
  conversionRate: number;
}

// Placeholder component showing mock analytics data
const ArtistAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days'>('30days');
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    artworkViews: [],
    totalSales: 0,
    salesAmount: 0,
    conversionRate: 0
  });
  
  // Fetch user's portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setPortfolios(data || []);
        if (data && data.length > 0) {
          setSelectedPortfolio(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };
    
    fetchPortfolios();
  }, [user]);
  
  // Fetch analytics data for the selected portfolio
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!selectedPortfolio) return;
      
      setLoading(true);
      
      // In a real implementation, we would fetch actual analytics data from the database
      // For now, we'll use mock data for demonstration purposes
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock data based on timeframe
        const mockData: AnalyticsData = {
          totalViews: timeframe === '7days' ? 145 : timeframe === '30days' ? 587 : 1203,
          artworkViews: [
            { artworkId: 'art1', artworkTitle: 'Abstract Composition', views: timeframe === '7days' ? 32 : timeframe === '30days' ? 124 : 287 },
            { artworkId: 'art2', artworkTitle: 'Urban Landscape', views: timeframe === '7days' ? 28 : timeframe === '30days' ? 103 : 245 },
            { artworkId: 'art3', artworkTitle: 'Portrait Study', views: timeframe === '7days' ? 45 : timeframe === '30days' ? 162 : 310 },
          ],
          totalSales: timeframe === '7days' ? 3 : timeframe === '30days' ? 8 : 15,
          salesAmount: timeframe === '7days' ? 450 : timeframe === '30days' ? 1250 : 2340,
          conversionRate: timeframe === '7days' ? 2.1 : timeframe === '30days' ? 1.4 : 1.25
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1000);
    };
    
    fetchAnalyticsData();
  }, [selectedPortfolio, timeframe]);
  
  const handlePortfolioChange = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
  };
  
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as '7days' | '30days' | '90days');
  };
  
  // Format currency for sales
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            You must be logged in to view your analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>
          {currentPortfolio 
            ? `View performance metrics for "${currentPortfolio.name}"`
            : 'Select a portfolio to view performance metrics'}
        </CardDescription>
        
        {portfolios.length > 0 && (
          <Tabs defaultValue={selectedPortfolio || undefined} onValueChange={handlePortfolioChange}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full max-w-md">
              {portfolios.map((portfolio) => (
                <TabsTrigger key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        <Tabs defaultValue={timeframe} onValueChange={handleTimeframeChange} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="7days">Last 7 days</TabsTrigger>
            <TabsTrigger value="30days">Last 30 days</TabsTrigger>
            <TabsTrigger value="90days">Last 90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-muted-foreground mr-2" />
                  <p className="text-2xl font-bold">{analyticsData.totalViews}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground mr-2" />
                  <p className="text-2xl font-bold">{analyticsData.totalSales}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sales Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData.salesAmount)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 text-muted-foreground mr-2" />
                  <p className="text-2xl font-bold">{analyticsData.conversionRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {!loading && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Top Performing Artworks</h3>
            <div className="rounded-md border">
              <div className="grid grid-cols-3 p-4 font-medium bg-muted">
                <div>Artwork</div>
                <div className="text-center">Views</div>
                <div className="text-right">Conversion</div>
              </div>
              {analyticsData.artworkViews.map((artwork) => (
                <div key={artwork.artworkId} className="grid grid-cols-3 p-4 border-t">
                  <div className="truncate">{artwork.artworkTitle}</div>
                  <div className="text-center">{artwork.views}</div>
                  <div className="text-right">{(artwork.views > 0 ? (Math.random() * 3).toFixed(1) : 0)}%</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: This is demo data. Real analytics tracking is being implemented.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <p className="text-sm text-muted-foreground">
          Analytics data is currently simulated and will be replaced with real data as users interact with your portfolio.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ArtistAnalyticsDashboard;
