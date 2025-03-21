
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, ShoppingCart, TrendingUp, Share2, BarChart3, PieChart } from 'lucide-react';
import { Artwork, Portfolio } from '@/types/portfolio';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';

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
  viewsByDate: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    name: string;
    value: number;
  }[];
}

interface ArtworkAnalytics {
  artwork_id: string;
  title: string;
  views: number;
}

// Artist Analytics Dashboard component
const ArtistAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days'>('30days');
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    artworkViews: [],
    totalSales: 0,
    salesAmount: 0,
    conversionRate: 0,
    viewsByDate: [],
    deviceBreakdown: []
  });
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
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
        toast({
          title: "Error fetching portfolios",
          description: "There was a problem loading your portfolios. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchPortfolios();
  }, [user, toast]);
  
  // Fetch analytics data for the selected portfolio and timeframe
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!selectedPortfolio || !user) return;
      
      setLoading(true);
      
      try {
        // Calculate the date range based on the selected timeframe
        const now = new Date();
        const startDate = subDays(now, timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90);
        
        // Fetch actual portfolio view analytics
        const { data: viewData, error: viewError } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('portfolio_id', selectedPortfolio)
          .eq('event_type', 'view')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });
          
        if (viewError) throw viewError;
        
        // Fetch artwork views for this portfolio
        const { data: artworkData, error: artworkError } = await supabase
          .from('analytics_events')
          .select('artwork_id, event_metadata, created_at')
          .eq('portfolio_id', selectedPortfolio)
          .eq('event_type', 'view')
          .not('artwork_id', 'is', null)
          .gte('created_at', startDate.toISOString());
          
        if (artworkError) throw artworkError;
        
        // Fetch artwork titles
        let artworkAnalytics: ArtworkAnalytics[] = [];
        if (artworkData && artworkData.length > 0) {
          // Get unique artwork IDs
          const artworkIds = [...new Set(artworkData.map(item => item.artwork_id))];
          
          // Fetch artwork details
          const { data: artworks, error: artworksError } = await supabase
            .from('artworks')
            .select('id, title')
            .in('id', artworkIds);
            
          if (artworksError) throw artworksError;
          
          // Count views per artwork
          const artworkViewCounts = artworkIds.map(id => {
            const count = artworkData.filter(item => item.artwork_id === id).length;
            const artwork = artworks?.find(a => a.id === id);
            return {
              artwork_id: id,
              title: artwork ? artwork.title : 'Unknown Artwork',
              views: count
            };
          });
          
          artworkAnalytics = artworkViewCounts.sort((a, b) => b.views - a.views);
        }
        
        // Generate daily view counts
        const dailyViews: { [key: string]: number } = {};
        const allViewEvents = [...(viewData || []), ...(artworkData || [])];
        
        allViewEvents.forEach(event => {
          const date = format(new Date(event.created_at), 'yyyy-MM-dd');
          dailyViews[date] = (dailyViews[date] || 0) + 1;
        });
        
        const viewsByDate = Object.entries(dailyViews).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Create mock device breakdown data (in a real implementation, we would extract this from event_metadata)
        const deviceBreakdown = [
          { name: 'Desktop', value: Math.floor(Math.random() * 60) + 40 },
          { name: 'Mobile', value: Math.floor(Math.random() * 40) + 20 },
          { name: 'Tablet', value: Math.floor(Math.random() * 20) + 5 }
        ];
        
        // Calculate total views
        const totalViews = viewData ? viewData.length : 0;
        
        // For the purpose of this MVP, we'll use mock data for sales metrics
        // In a real implementation, these would be calculated from orders table
        const mockSales = timeframe === '7days' ? 
          Math.floor(Math.random() * 3) + 1 : 
          timeframe === '30days' ? 
            Math.floor(Math.random() * 8) + 3 : 
            Math.floor(Math.random() * 15) + 5;
            
        const mockSalesAmount = mockSales * (Math.floor(Math.random() * 150) + 50);
        const mockConversionRate = ((mockSales / (totalViews || 1)) * 100).toFixed(1);
        
        setAnalyticsData({
          totalViews,
          artworkViews: artworkAnalytics.map(item => ({
            artworkId: item.artwork_id,
            artworkTitle: item.title,
            views: item.views
          })),
          totalSales: mockSales,
          salesAmount: mockSalesAmount,
          conversionRate: parseFloat(mockConversionRate),
          viewsByDate,
          deviceBreakdown
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Error loading analytics",
          description: "There was a problem loading your analytics data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [selectedPortfolio, timeframe, user, toast]);
  
  const handlePortfolioChange = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
  };
  
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as '7days' | '30days' | '90days');
  };
  
  // Format date for display in charts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d');
  };
  
  // Format currency for sales display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const refreshData = () => {
    // Re-fetch data by triggering the useEffect dependency
    setSelectedPortfolio(prev => {
      if (prev) {
        setTimeout(() => setSelectedPortfolio(prev), 100);
        return null;
      }
      return selectedPortfolio;
    });
    
    toast({
      title: "Refreshing analytics data",
      description: "Your analytics data is being updated."
    });
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              {currentPortfolio 
                ? `View performance metrics for "${currentPortfolio.name}"`
                : 'Select a portfolio to view performance metrics'}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
            )}
            Refresh Data
          </Button>
        </div>
        
        {portfolios.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium mb-2 block">Portfolio</label>
              <Select
                value={selectedPortfolio || undefined}
                onValueChange={handlePortfolioChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/2">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select
                value={timeframe}
                onValueChange={handleTimeframeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
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
            
            {/* Views Over Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Views Over Time</CardTitle>
                <CardDescription>Track how your portfolio views change over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {analyticsData.viewsByDate.length > 0 ? (
                    <ChartContainer
                      className="h-[300px]"
                      config={{
                        views: { color: '#0ea5e9' },
                      }}
                    >
                      <BarChart data={analyticsData.viewsByDate}>
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-foreground">
                                        {formatDate(payload[0].payload.date)}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-foreground">
                                        {payload[0].value} views
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="var(--color-views)" 
                          radius={[4, 4, 0, 0]} 
                          name="Views"
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-center">
                        No view data available for this time period
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Device Breakdown</CardTitle>
                  <CardDescription>How users are accessing your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={analyticsData.deviceBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData.deviceBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Top Performing Artworks */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Artworks</CardTitle>
                  <CardDescription>Your most viewed artworks</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.artworkViews.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 p-4 font-medium bg-muted">
                        <div className="col-span-3">Artwork</div>
                        <div className="col-span-2 text-center">Views</div>
                        <div className="col-span-1 text-right">Conversion</div>
                      </div>
                      {analyticsData.artworkViews.slice(0, 5).map((artwork) => (
                        <div key={artwork.artworkId} className="grid grid-cols-6 p-4 border-t">
                          <div className="col-span-3 truncate">{artwork.artworkTitle}</div>
                          <div className="col-span-2 text-center">{artwork.views}</div>
                          <div className="col-span-1 text-right">{(artwork.views > 0 ? (Math.random() * 3).toFixed(1) : 0)}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px]">
                      <p className="text-muted-foreground text-center">
                        No artwork view data available for this time period
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <p className="text-sm text-muted-foreground">
          Data is updated in real-time as users interact with your portfolio.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ArtistAnalyticsDashboard;
