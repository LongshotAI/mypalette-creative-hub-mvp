
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Artwork, PortfolioWithArtist } from '@/types/portfolio';
import { Loader2, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DefaultLayout from '@/components/layout/DefaultLayout';
import GridTemplate from '@/components/portfolio/templates/GridTemplate';
import MasonryTemplate from '@/components/portfolio/templates/MasonryTemplate';
import SlideshowTemplate from '@/components/portfolio/templates/SlideshowTemplate';
import MinimalTemplate from '@/components/portfolio/templates/MinimalTemplate';
import GalleryTemplate from '@/components/portfolio/templates/GalleryTemplate';
import StudioTemplate from '@/components/portfolio/templates/StudioTemplate';
import * as portfolioApi from '@/services/api/portfolio.api';
import * as artworkApi from '@/services/api/artwork.api';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/analytics';

const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!portfolioId) {
        setError('No portfolio ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching portfolio data for ID:', portfolioId);
        
        // Fetch portfolio with user info
        const portfolioResponse = await portfolioApi.getPortfolioWithUser(portfolioId);
        
        if (portfolioResponse.status !== 'success' || !portfolioResponse.data) {
          console.error('Portfolio fetch error:', portfolioResponse.error);
          setError(portfolioResponse.error?.message || 'Portfolio not found or is not accessible');
          toast.error('Portfolio not found or is not accessible');
          setLoading(false);
          return;
        }
        
        console.log('Portfolio data retrieved:', portfolioResponse.data);
        setPortfolio(portfolioResponse.data);
        
        // Track portfolio view after successful retrieval
        analytics.trackPortfolioView(portfolioId);
        
        // Fetch artworks for the portfolio
        const artworkResponse = await artworkApi.getPortfolioArtworks(portfolioId);
        
        if (artworkResponse.status === 'success') {
          console.log('Artworks retrieved:', artworkResponse.data?.length || 0);
          setArtworks(artworkResponse.data || []);
        } else {
          console.error('Error fetching artworks:', artworkResponse.error);
          toast.error('Could not load artwork for this portfolio');
        }
      } catch (error) {
        console.error('Error in portfolio fetch flow:', error);
        setError('Failed to load portfolio details');
        toast.error('Error loading portfolio details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, [portfolioId, analytics]);

  // Track artwork view when a user interacts with an artwork
  const handleArtworkView = (artworkId: string) => {
    if (portfolioId) {
      analytics.trackArtworkView(artworkId, portfolioId);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-12 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !portfolio) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-12 min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4">Portfolio not found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The portfolio you\'re looking for might have been removed or is private.'}</p>
          <Button asChild>
            <Link to="/portfolios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              View All Portfolios
            </Link>
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  // Apply theme-based styles
  const getThemeStyles = () => {
    switch(portfolio.theme) {
      case 'minimal':
        return 'bg-white text-gray-900';
      case 'bold':
        return 'bg-gray-900 text-white';
      case 'elegant':
        return 'bg-stone-50 text-stone-900';
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      default:
        return 'bg-background text-foreground';
    }
  };

  const artistName = portfolio.profiles?.full_name || portfolio.profiles?.username || 'Artist';

  return (
    <DefaultLayout>
      <div className={`min-h-screen ${getThemeStyles()}`}>
        <div className="container mx-auto py-12">
          <div className="mb-8">
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link to={`/user/${portfolio.user_id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Artist Profile
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">{portfolio.name}</h1>
            
            {portfolio.description && (
              <p className="text-lg mb-4 max-w-3xl">{portfolio.description}</p>
            )}
            
            <div className="flex items-center">
              <Link 
                to={`/user/${portfolio.user_id}`} 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                {artistName}
              </Link>
            </div>
          </div>
          
          {artworks.length === 0 ? (
            <div className="bg-muted/30 border border-border/50 rounded-lg p-12 text-center">
              <h3 className="text-xl font-medium mb-2">No Artworks Yet</h3>
              <p className="text-muted-foreground mb-6">
                This portfolio is empty. The artist hasn't added any artworks yet.
              </p>
            </div>
          ) : (
            <div className="mb-8">
              {/* Pass the handleArtworkView callback to each template */}
              {portfolio.template === 'grid' && <GridTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
              {portfolio.template === 'masonry' && <MasonryTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
              {portfolio.template === 'slideshow' && <SlideshowTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
              {portfolio.template === 'minimal' && <MinimalTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
              {portfolio.template === 'gallery' && <GalleryTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
              {portfolio.template === 'studio' && <StudioTemplate artworks={artworks} onArtworkView={handleArtworkView} />}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PortfolioDetail;
