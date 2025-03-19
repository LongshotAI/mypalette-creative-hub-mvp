
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Instagram, Twitter, Globe, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioWithArtist, Artwork } from '@/types/portfolio';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import GridTemplate from '@/components/portfolio/templates/GridTemplate';
import MasonryTemplate from '@/components/portfolio/templates/MasonryTemplate';
import SlideshowTemplate from '@/components/portfolio/templates/SlideshowTemplate';
import { toast } from 'sonner';

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch portfolio with artist profile information
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select(`
            *,
            profiles:user_id (
              full_name,
              username,
              avatar_url,
              bio,
              instagram_url,
              twitter_url,
              website_url
            )
          `)
          .eq('id', id)
          .eq('is_public', true)
          .single();
        
        if (portfolioError) throw portfolioError;
        
        if (!portfolioData) {
          toast.error('Portfolio not found or is private');
          setLoading(false);
          return;
        }
        
        setPortfolio(portfolioData as unknown as PortfolioWithArtist);
        
        // Fetch artworks for this portfolio
        const { data: artworksData, error: artworksError } = await supabase
          .from('artworks')
          .select('*')
          .eq('portfolio_id', id)
          .order('created_at', { ascending: false });
        
        if (artworksError) throw artworksError;
        
        setArtworks(artworksData);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast.error('Failed to load portfolio');
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
                  By {portfolio.profiles.full_name}
                </div>
                
                <div className="flex space-x-2">
                  {portfolio.profiles.instagram_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={portfolio.profiles.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                    </Button>
                  )}
                  
                  {portfolio.profiles.twitter_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={portfolio.profiles.twitter_url} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </Button>
                  )}
                  
                  {portfolio.profiles.website_url && (
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
              
              {portfolio.profiles.bio && (
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
