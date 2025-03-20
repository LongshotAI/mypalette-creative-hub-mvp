
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, Image, BookOpen, Calendar } from 'lucide-react';

interface AdminStatsProps {
  adminType: string | null;
  lastLogin: string | null;
}

interface StatsData {
  totalUsers: number;
  totalPortfolios: number;
  totalArtworks: number;
  totalEducationResources: number;
  totalOpenCalls: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({ adminType, lastLogin }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalPortfolios: 0,
    totalArtworks: 0,
    totalEducationResources: 0,
    totalOpenCalls: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch portfolio count
        const { count: portfolioCount, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*', { count: 'exact', head: true });
        
        // Fetch artwork count
        const { count: artworkCount, error: artworkError } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true });
        
        // Fetch education resources count
        const { count: educationCount, error: educationError } = await supabase
          .from('education_resources')
          .select('*', { count: 'exact', head: true });
        
        // Fetch open calls count
        const { count: openCallsCount, error: openCallsError } = await supabase
          .from('open_calls')
          .select('*', { count: 'exact', head: true });
        
        if (userError || portfolioError || artworkError || educationError || openCallsError) {
          console.error('Error fetching stats', { 
            userError, portfolioError, artworkError, educationError, openCallsError 
          });
          return;
        }
        
        setStats({
          totalUsers: userCount || 0,
          totalPortfolios: portfolioCount || 0,
          totalArtworks: artworkCount || 0,
          totalEducationResources: educationCount || 0,
          totalOpenCalls: openCallsCount || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Last login: {formatDate(lastLogin)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-layout-grid mx-auto mb-2 text-purple-500"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            <p className="text-2xl font-bold">{stats.totalPortfolios}</p>
            <p className="text-sm text-muted-foreground">Portfolios</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Image className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.totalArtworks}</p>
            <p className="text-sm text-muted-foreground">Artworks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{stats.totalEducationResources}</p>
            <p className="text-sm text-muted-foreground">Resources</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.totalOpenCalls}</p>
            <p className="text-sm text-muted-foreground">Open Calls</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
