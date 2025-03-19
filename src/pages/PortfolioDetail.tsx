
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Instagram, Twitter, Globe, Loader2, Calendar, Share, Mail, User, Star, ArrowRight, MessageCircle, MapPin, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortfolioWithArtist, Artwork } from '@/types/portfolio';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import GridTemplate from '@/components/portfolio/templates/GridTemplate';
import MasonryTemplate from '@/components/portfolio/templates/MasonryTemplate';
import SlideshowTemplate from '@/components/portfolio/templates/SlideshowTemplate';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artworkCount, setArtworkCount] = useState(0);
  const [morePortfolios, setMorePortfolios] = useState<PortfolioWithArtist[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching portfolio details for ID:', id);
        
        // First fetch the portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', id)
          .single();
        
        if (portfolioError) {
          console.error('Error fetching portfolio:', portfolioError);
          toast.error('Failed to load portfolio');
          setError('Failed to load portfolio: ' + portfolioError.message);
          setLoading(false);
          return;
        }
        
        if (!portfolioData) {
          toast.error('Portfolio not found or is private');
          setError('Portfolio not found or is private');
          setLoading(false);
          return;
        }
        
        console.log('Fetched portfolio data:', portfolioData);
        
        // Get the user profile separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', portfolioData.user_id)
          .single();
          
        if (profileError) {
          console.warn(`Error fetching profile for user ${portfolioData.user_id}:`, profileError);
        }
        
        // Combine portfolio with profile data
        const portfolioWithProfile = {
          ...portfolioData,
          profiles: profileError ? null : profileData
        };
        
        console.log('Portfolio with profile:', portfolioWithProfile);
        setPortfolio(portfolioWithProfile as PortfolioWithArtist);
        
        // Fetch artworks for this portfolio
        const { data: artworksData, error: artworksError } = await supabase
          .from('artworks')
          .select('*')
          .eq('portfolio_id', id)
          .order('created_at', { ascending: false });
        
        if (artworksError) {
          console.error('Error fetching artworks:', artworksError);
          toast.error('Failed to load artworks');
          setError(`Failed to load artworks: ${artworksError.message}`);
        } else {
          console.log('Fetched artworks:', artworksData);
          setArtworks(artworksData || []);
          setArtworkCount(artworksData?.length || 0);
          
          // Set the first artwork as featured if there are any
          if (artworksData && artworksData.length > 0) {
            setFeaturedArtwork(artworksData[0]);
          }
        }
        
        // Fetch more portfolios from the same artist
        if (portfolioData.user_id) {
          const { data: morePortfoliosData, error: morePortfoliosError } = await supabase
            .from('portfolios')
            .select('*, profiles(*)')
            .eq('user_id', portfolioData.user_id)
            .eq('is_public', true)
            .neq('id', id)
            .limit(3);
            
          if (!morePortfoliosError && morePortfoliosData) {
            setMorePortfolios(morePortfoliosData as PortfolioWithArtist[]);
          }
        }
        
        // Fetch more public portfolios for "Browse More" section
        if (morePortfolios.length === 0) {
          const { data: publicPortfoliosData } = await supabase
            .from('portfolios')
            .select('*, profiles(*)')
            .eq('is_public', true)
            .neq('id', id)
            .limit(3);
            
          if (publicPortfoliosData) {
            setMorePortfolios(publicPortfoliosData as PortfolioWithArtist[]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching portfolio:', error);
        toast.error('Failed to load portfolio');
        setError(`Failed to load portfolio: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, [id]);

  const handleSharePortfolio = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: portfolio?.name || 'Artist Portfolio',
        text: portfolio?.description || 'Check out this artist portfolio',
        url: url,
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Portfolio URL copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy URL');
    });
  };

  const renderTemplate = () => {
    if (!portfolio || artworks.length === 0) return null;
    
    switch (portfolio.template) {
      case 'grid':
        return <GridTemplate artworks={artworks} />;
      case 'masonry':
        return <MasonryTemplate artworks={artworks} />;
      case 'slideshow':
        return <SlideshowTemplate artworks={artworks} />;
      default:
        return <GridTemplate artworks={artworks} />;
    }
  };

  const renderArtistProfile = () => {
    if (!portfolio?.profiles) return null;

    return (
      <div className="bg-muted/20 rounded-lg p-6 mb-8 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <Avatar className="h-20 w-20 border-2 border-background hover-scale">
            <AvatarImage src={portfolio.profiles.avatar_url || undefined} alt={portfolio.profiles.full_name || 'Artist'} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-xl font-bold">{portfolio.profiles.full_name || 'Anonymous Artist'}</h2>
            {portfolio.profiles.username && (
              <p className="text-muted-foreground">@{portfolio.profiles.username}</p>
            )}
          </div>
        </div>
        
        {portfolio.profiles.bio && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">About the Artist</h3>
            <p className="text-muted-foreground">{portfolio.profiles.bio}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {portfolio.profiles.instagram_url && (
            <Button variant="outline" size="sm" asChild className="hover-scale">
              <a href={portfolio.profiles.instagram_url} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </a>
            </Button>
          )}
          
          {portfolio.profiles.twitter_url && (
            <Button variant="outline" size="sm" asChild className="hover-scale">
              <a href={portfolio.profiles.twitter_url} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </a>
            </Button>
          )}
          
          {portfolio.profiles.website_url && (
            <Button variant="outline" size="sm" asChild className="hover-scale">
              <a href={portfolio.profiles.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
          
          <Button variant="secondary" size="sm" onClick={handleSharePortfolio} className="hover-scale">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="default" size="sm" asChild className="hover-scale">
            <a href={`mailto:${portfolio.profiles.contact_email || ''}`}>
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </a>
          </Button>
        </div>
      </div>
    );
  };
  
  const renderFeatureSection = () => {
    if (!featuredArtwork) return null;
    
    return (
      <div className="mb-8 bg-muted/10 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 aspect-square overflow-hidden">
            <img 
              src={featuredArtwork.image_url} 
              alt={featuredArtwork.title} 
              className="w-full h-full object-cover hover-grow"
            />
          </div>
          <div className="md:w-1/2 p-6 flex flex-col justify-center">
            <Badge variant="outline" className="self-start mb-2">
              <Star className="h-3 w-3 mr-1 text-amber-500" />
              Featured Work
            </Badge>
            <h3 className="text-2xl font-semibold mb-3">{featuredArtwork.title}</h3>
            {featuredArtwork.description && (
              <p className="text-muted-foreground mb-4">{featuredArtwork.description}</p>
            )}
            {featuredArtwork.for_sale && featuredArtwork.price && (
              <p className="font-medium mb-4">
                Price: {featuredArtwork.currency} {featuredArtwork.price}
              </p>
            )}
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Created {format(new Date(featuredArtwork.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderMorePortfolios = () => {
    if (morePortfolios.length === 0) return null;
    
    return (
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-xl font-semibold mb-6">More to Explore</h3>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {morePortfolios.map(otherPortfolio => (
            <Card key={otherPortfolio.id} className="overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <Link to={`/portfolio/${otherPortfolio.id}`} className="block">
                <div className="aspect-[3/2] bg-muted/20 flex items-center justify-center">
                  {otherPortfolio.profiles?.avatar_url ? (
                    <img 
                      src={otherPortfolio.profiles.avatar_url} 
                      alt={otherPortfolio.profiles.full_name || 'Artist'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1">{otherPortfolio.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    By {otherPortfolio.profiles?.full_name || 'Anonymous Artist'}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Button variant="outline" asChild className="hover-scale">
            <Link to="/portfolios">
              Browse All Portfolios
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };
  
  const renderNavigationButtons = () => {
    if (!portfolio) return null;
    
    return (
      <div className="flex justify-between mt-12 pt-6 border-t">
        <Button variant="ghost" size="sm" asChild className="hover-scale">
          <Link to="/portfolios">
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            All Portfolios
          </Link>
        </Button>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleSharePortfolio} className="hover-scale">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            Share this portfolio with others via email, social media, or by copying the link.
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8 px-4">
        <Link to="/portfolios" className="inline-flex items-center text-primary mb-6 hover:underline hover-scale">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolios
        </Link>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : !portfolio ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Portfolio not found</h2>
            <p className="text-muted-foreground mb-6">This portfolio may be private or doesn't exist.</p>
            <Button asChild className="hover-scale">
              <Link to="/portfolios">View Other Portfolios</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar with artist info */}
            <div className="md:w-1/3 lg:w-1/4">
              {renderArtistProfile()}
              
              <div className="bg-muted/20 rounded-lg p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-medium mb-4">Portfolio Details</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{format(new Date(portfolio.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium capitalize">{portfolio.template}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artworks</span>
                    <span className="font-medium">{artworkCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility</span>
                    <Badge variant={portfolio.is_public ? "outline" : "secondary"}>
                      {portfolio.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:w-2/3 lg:w-3/4">
              <div className="border-b pb-6 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{portfolio.name}</h1>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSharePortfolio} className="hover-scale">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                {portfolio.description && (
                  <div className="text-muted-foreground">
                    {portfolio.description}
                  </div>
                )}
              </div>
              
              {/* Featured Artwork Section */}
              {artworks.length > 0 && renderFeatureSection()}
              
              {artworks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No artworks in this portfolio yet.</p>
                </div>
              ) : (
                <div className="mb-8">
                  {renderTemplate()}
                </div>
              )}
              
              {/* Navigation buttons */}
              {renderNavigationButtons()}
              
              {/* More portfolios section */}
              {renderMorePortfolios()}
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PortfolioDetail;
