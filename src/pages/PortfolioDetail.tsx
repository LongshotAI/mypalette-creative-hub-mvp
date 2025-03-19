
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Instagram, Twitter, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortfolioWithArtist, Artwork } from '@/types/portfolio';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import GridTemplate from '@/components/portfolio/templates/GridTemplate';
import MasonryTemplate from '@/components/portfolio/templates/MasonryTemplate';
import SlideshowTemplate from '@/components/portfolio/templates/SlideshowTemplate';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <>
            <div className="border-b pb-6 mb-8">
              <h1 className="text-3xl font-bold mb-4">{portfolio.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="text-lg font-medium">
                  By {portfolio.profiles?.full_name || 'Anonymous Artist'}
                </div>
                
                <div className="flex space-x-2">
                  {portfolio.profiles?.instagram_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={portfolio.profiles.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                    </Button>
                  )}
                  
                  {portfolio.profiles?.twitter_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={portfolio.profiles.twitter_url} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </Button>
                  )}
                  
                  {portfolio.profiles?.website_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={portfolio.profiles.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-5 w-5" />
                        <span className="sr-only">Website</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              {portfolio.description && (
                <div className="text-muted-foreground max-w-3xl">
                  {portfolio.description}
                </div>
              )}
              
              {portfolio.profiles?.bio && (
                <div className="mt-4 border-t pt-4 max-w-3xl">
                  <h3 className="text-lg font-medium mb-2">About the Artist</h3>
                  <p className="text-muted-foreground">{portfolio.profiles.bio}</p>
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
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PortfolioDetail;
