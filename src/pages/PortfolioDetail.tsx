import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Instagram, Twitter, Globe, Loader2, Calendar, Share, Mail, MapPin, Eye, User } from 'lucide-react';
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

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artworkCount, setArtworkCount] = useState(0);

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
      <div className="bg-muted/20 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <Avatar className="h-20 w-20 border-2 border-background">
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
            <Button variant="outline" size="sm" asChild>
              <a href={portfolio.profiles.instagram_url} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </a>
            </Button>
          )}
          
          {portfolio.profiles.twitter_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={portfolio.profiles.twitter_url} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </a>
            </Button>
          )}
          
          {portfolio.profiles.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={portfolio.profiles.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
          
          <Button variant="secondary" size="sm" onClick={handleSharePortfolio}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button variant="default" size="sm" asChild>
            <a href={`mailto:${portfolio.profiles.contact_email || portfolio.profiles.email || ''}`}>
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8 px-4">
        <Link to="/portfolios" className="inline-flex items-center text-primary mb-6 hover:underline">
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
            <Button asChild>
              <Link to="/portfolios">View Other Portfolios</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar with artist info */}
            <div className="md:w-1/3 lg:w-1/4">
              {renderArtistProfile()}
              
              <div className="bg-muted/20 rounded-lg p-6">
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
                    <Button variant="outline" size="sm" onClick={handleSharePortfolio}>
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
              
              {artworks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No artworks in this portfolio yet.</p>
                </div>
              ) : (
                <div className="mb-8">
                  {renderTemplate()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PortfolioDetail;
