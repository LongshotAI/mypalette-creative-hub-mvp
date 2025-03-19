
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, User, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortfolioWithArtist } from '@/types/portfolio';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching public portfolios...');
        
        // First, fetch the public portfolios
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        if (portfolioError) {
          console.error('Error fetching portfolios:', portfolioError);
          toast.error('Failed to load portfolios');
          setError('Failed to load portfolios: ' + portfolioError.message);
          setPortfolios([]);
          return;
        }
        
        if (!portfolioData || portfolioData.length === 0) {
          console.log('No public portfolios found');
          setPortfolios([]);
          setLoading(false);
          return;
        }

        console.log('Fetched portfolios:', portfolioData);
        
        // Now fetch the user profiles separately for each portfolio
        const portfoliosWithProfiles = await Promise.all(
          portfolioData.map(async (portfolio) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', portfolio.user_id)
              .single();
              
            if (profileError) {
              console.warn(`Error fetching profile for user ${portfolio.user_id}:`, profileError);
              return { ...portfolio, profiles: null };
            }
            
            return { ...portfolio, profiles: profileData };
          })
        );
        
        console.log('Portfolios with profiles:', portfoliosWithProfiles);
        setPortfolios(portfoliosWithProfiles as PortfolioWithArtist[]);
      } catch (error: any) {
        console.error('Error fetching portfolios:', error);
        toast.error('Failed to load portfolios');
        setError('Failed to load portfolios: ' + error.message);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolios();
  }, []);

  // Filter portfolios based on search query
  const filteredPortfolios = portfolios.filter(portfolio => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = portfolio.name.toLowerCase().includes(searchLower);
    const artistMatch = portfolio.profiles?.full_name?.toLowerCase().includes(searchLower);
    const descMatch = portfolio.description?.toLowerCase().includes(searchLower);
    
    return nameMatch || artistMatch || descMatch;
  });

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Artist Portfolios</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover unique works from artists around the world. Browse through their portfolios and find your next favorite piece.
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search portfolios by artist or title..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="text-center py-16">
            <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No portfolios found</h2>
            <p className="text-muted-foreground mb-8">
              {searchQuery ? 'Try a different search term' : 'Check back soon for new artist portfolios'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPortfolios.map((portfolio) => (
              <Card key={portfolio.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/portfolio/${portfolio.id}`}>
                  <div className="aspect-[3/2] bg-accent/10 flex items-center justify-center">
                    {portfolio.profiles?.avatar_url ? (
                      <img 
                        src={portfolio.profiles.avatar_url} 
                        alt={`${portfolio.profiles.full_name || 'Artist'}'s avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-1">{portfolio.name}</h2>
                        <div className="flex items-center text-muted-foreground text-sm mb-3">
                          <User className="h-3 w-3 mr-1" />
                          <span>{portfolio.profiles?.full_name || 'Anonymous Artist'}</span>
                        </div>
                      </div>
                    </div>
                    {portfolio.description && (
                      <p className="text-muted-foreground line-clamp-2">{portfolio.description}</p>
                    )}
                  </CardContent>
                </Link>
                <CardFooter className="px-6 py-4 bg-muted/10 border-t">
                  <Button asChild className="w-full">
                    <Link to={`/portfolio/${portfolio.id}`}>View Portfolio</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Portfolios;
