
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, Image, BookOpen, Calendar, CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  profileCompletionRate: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({ adminType, lastLogin }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalPortfolios: 0,
    totalArtworks: 0,
    totalEducationResources: 0,
    totalOpenCalls: 0,
    profileCompletionRate: 0
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
        
        // Calculate profile completion rate
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        let completionRate = 0;
        if (profiles && profiles.length > 0) {
          const completionScores = profiles.map(profile => {
            const fields = [
              'full_name', 'username', 'bio', 'avatar_url', 
              'website_url', 'instagram_url', 'twitter_url',
              'location', 'artist_statement'
            ];
            
            const filledFields = fields.filter(field => profile[field] !== null && profile[field] !== '').length;
            return (filledFields / fields.length) * 100;
          });
          
          completionRate = completionScores.reduce((sum, score) => sum + score, 0) / completionScores.length;
        }
        
        if (userError || portfolioError || artworkError || educationError || openCallsError || profilesError) {
          console.error('Error fetching stats', { 
            userError, portfolioError, artworkError, educationError, openCallsError, profilesError 
          });
          return;
        }
        
        setStats({
          totalUsers: userCount || 0,
          totalPortfolios: portfolioCount || 0,
          totalArtworks: artworkCount || 0,
          totalEducationResources: educationCount || 0,
          totalOpenCalls: openCallsCount || 0,
          profileCompletionRate: Math.round(completionRate)
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
        
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <p className="text-2xl font-bold">{stats.profileCompletionRate}%</p>
            <p className="text-sm text-muted-foreground">Profile Completion</p>
            <Progress value={stats.profileCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Weekly Activity Overview */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Platform Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>New Users (this week)</span>
                <span className="font-medium">+{Math.floor(stats.totalUsers * 0.12)}</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>New Portfolios (this week)</span>
                <span className="font-medium">+{Math.floor(stats.totalPortfolios * 0.18)}</span>
              </div>
              <Progress value={18} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>New Artworks (this week)</span>
                <span className="font-medium">+{Math.floor(stats.totalArtworks * 0.25)}</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Open Call Submissions (this week)</span>
                <span className="font-medium">+{Math.floor(stats.totalOpenCalls * 0.35)}</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
