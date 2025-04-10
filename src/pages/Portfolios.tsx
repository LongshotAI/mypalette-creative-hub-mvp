
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, User, Image, Calendar, Eye, Filter, Heart, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortfolioWithArtist } from '@/types/portfolio';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [featuredArtworks, setFeaturedArtworks] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [featured, setFeatured] = useState<PortfolioWithArtist | null>(null);

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
        
        // Select a featured portfolio randomly from the first 5
        if (portfoliosWithProfiles.length > 0) {
          const featuredIndex = Math.floor(Math.random() * Math.min(5, portfoliosWithProfiles.length));
          setFeatured(portfoliosWithProfiles[featuredIndex] as PortfolioWithArtist);
        }
        
        setPortfolios(portfoliosWithProfiles as PortfolioWithArtist[]);
        
        // Fetch a featured artwork for each portfolio
        const portfolioIds = portfolioData.map(p => p.id);
        
        // For each portfolio, get the most recent artwork
        const artworkPromises = portfolioIds.map(async (portfolioId) => {
          const { data: artworkData, error: artworkError } = await supabase
            .from('artworks')
            .select('image_url')
            .eq('portfolio_id', portfolioId)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (artworkError || !artworkData || artworkData.length === 0) {
            return { portfolioId, imageUrl: null };
          }
          
          return { portfolioId, imageUrl: artworkData[0].image_url };
        });
        
        const artworkResults = await Promise.all(artworkPromises);
        const featuredArtworkMap: Record<string, string> = {};
        
        artworkResults.forEach(result => {
          if (result.imageUrl) {
            featuredArtworkMap[result.portfolioId] = result.imageUrl;
          }
        });
        
        setFeaturedArtworks(featuredArtworkMap);
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
  
  // Sort the filtered portfolios
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  const renderFeaturedPortfolio = () => {
    if (!featured || !featuredArtworks[featured.id]) return null;
    
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold">Featured Portfolio</h2>
        </div>
        
        <div className="rounded-xl overflow-hidden shadow-lg bg-muted/5 hover:shadow-xl transition-all duration-300">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="h-64 md:h-auto overflow-hidden">
              <img 
                src={featuredArtworks[featured.id]} 
                alt={`Featured artwork from ${featured.name}`}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <Badge variant="outline" className="mb-2 self-start">
                Featured Artist
              </Badge>
              <h3 className="text-2xl font-bold mb-2">{featured.name}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {featured.description || 'A collection of artworks by ' + (featured.profiles?.full_name || 'an artist')}
              </p>
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <User className="h-4 w-4 mr-1" />
                <span>{featured.profiles?.full_name || 'Anonymous Artist'}</span>
              </div>
              <Button asChild className="self-start hover-scale">
                <Link to={`/portfolio/${featured.id}`}>
                  View Portfolio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Artist Portfolios</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore unique collections from talented artists around the world. 
            Browse through their portfolios to find your next favorite piece or commission an artist directly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search portfolios by artist name, title, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <>
            {/* Featured Portfolio */}
            {!searchQuery && renderFeaturedPortfolio()}
            
            {/* Portfolio Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPortfolios.map((portfolio) => (
                <Card key={portfolio.id} className="overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <Link to={`/portfolio/${portfolio.id}`} className="flex-grow">
                    <div className="aspect-[4/3] bg-accent/10 flex items-center justify-center overflow-hidden">
                      {featuredArtworks[portfolio.id] ? (
                        <img 
                          src={featuredArtworks[portfolio.id]} 
                          alt={`Featured artwork from ${portfolio.name}`}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : portfolio.profiles?.avatar_url ? (
                        <img 
                          src={portfolio.profiles.avatar_url} 
                          alt={`${portfolio.profiles.full_name || 'Artist'}'s avatar`}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <Image className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold">{portfolio.name}</h2>
                            <Badge variant="outline" className="ml-1">
                              {portfolio.template.charAt(0).toUpperCase() + portfolio.template.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm mb-3">
                            <User className="h-3 w-3 mr-1" />
                            <span>{portfolio.profiles?.full_name || 'Anonymous Artist'}</span>
                          </div>
                        </div>
                      </div>
                      {portfolio.description && (
                        <p className="text-muted-foreground line-clamp-3">{portfolio.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{portfolio.created_at ? format(new Date(portfolio.created_at), 'MMM d, yyyy') : 'Unknown date'}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>Public</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="px-6 py-4 bg-muted/10 border-t">
                    <Button asChild className="w-full hover-scale">
                      <Link to={`/portfolio/${portfolio.id}`}>View Portfolio</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Portfolios;
