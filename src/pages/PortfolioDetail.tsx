
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Artwork, PortfolioWithArtist } from '@/types/portfolio';
import { Loader2, User, ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Skeleton } from '@/components/ui/skeleton';

const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioWithArtist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  const analytics = useAnalytics();

  // Memoize the fetch function to prevent infinite loops
  const fetchPortfolioData = useCallback(async () => {
    if (!portfolioId) {
      setError('No portfolio ID provided');
      setLoading(false);
      setDataFetched(true);
      return;
    }
    
    try {
      console.log('Fetching portfolio data for ID:', portfolioId);
      
      // Fetch portfolio with user info
      const portfolioResponse = await portfolioApi.getPortfolioWithUser(portfolioId);
      
      if (portfolioResponse.status !== 'success' || !portfolioResponse.data) {
        console.error('Portfolio fetch error:', portfolioResponse.error);
        setError(portfolioResponse.error?.message || 'Portfolio not found or is not accessible');
        setLoading(false);
        setDataFetched(true);
        return;
      }
      
      console.log('Portfolio data retrieved successfully:', portfolioResponse.data);
      setPortfolio(portfolioResponse.data);
      
      // Track portfolio view after successful retrieval
      try {
        analytics.trackPortfolioView(portfolioId);
      } catch (analyticsError) {
        console.error('Error storing portfolio view analytics:', analyticsError);
        // Don't block the main flow for analytics errors
      }
      
      // Fetch artworks for the portfolio
      try {
        const artworkResponse = await artworkApi.getPortfolioArtworks(portfolioId);
        
        if (artworkResponse.status === 'success') {
          console.log('Artworks retrieved:', artworkResponse.data?.length || 0);
          setArtworks(artworkResponse.data || []);
        } else {
          console.error('Error fetching artworks:', artworkResponse.error);
          // Still continue with empty artworks array
          setArtworks([]);
        }
      } catch (artworkError) {
        console.error('Error fetching artworks:', artworkError);
        // Continue with empty artworks array
        setArtworks([]);
      }
      
      setLoading(false);
      setDataFetched(true);
    } catch (error) {
      console.error('Error in portfolio fetch flow:', error);
      setError('Failed to load portfolio details');
      setLoading(false);
      setDataFetched(true);
    }
  }, [portfolioId, analytics]);

  useEffect(() => {
    // Important: Only fetch if not already fetched for this ID
    if (portfolioId && !dataFetched) {
      setPortfolio(null);
      setArtworks([]);
      setError(null);
      setLoading(true);
      
      // Added timeout to avoid potential race conditions
      const timeoutId = setTimeout(() => {
        fetchPortfolioData();
      }, 0);
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [portfolioId, fetchPortfolioData, dataFetched]);

  // Reset dataFetched when portfolioId changes
  useEffect(() => {
    setDataFetched(false);
  }, [portfolioId]);

  // Track artwork view when a user interacts with an artwork  
  const handleArtworkView = (artworkId: string) => {
    if (!portfolioId || !artworkId) return;
    
    try {
      analytics.trackArtworkView(artworkId, portfolioId);
    } catch (error) {
      console.error('Error tracking artwork view:', error);
      // Non-blocking analytics error
    }
  };

  // If still loading, show skeleton loader
  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-12 min-h-screen">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-2xl mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-64 w-full rounded-md" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !portfolio) {
    return (
      <DefaultLayout>
        <div className="container mx-auto py-12 min-h-screen flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Portfolio not found</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {error || 'The portfolio you\'re looking for might have been removed or is private.'}
          </p>
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

  // Apply theme-based styles (with fallback to default)
  const getThemeStyles = () => {
    const theme = portfolio.theme || 'default';
    
    switch(theme) {
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

  // Get template component with fallback to grid
  const renderTemplate = () => {
    // Default to grid if template is missing or invalid
    const template = portfolio.template || 'grid';
    
    switch(template) {
      case 'grid':
        return <GridTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      case 'masonry':
        return <MasonryTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      case 'slideshow':
        return <SlideshowTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      case 'minimal':
        return <MinimalTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      case 'gallery':
        return <GalleryTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      case 'studio':
        return <StudioTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
      default:
        // Fallback to grid for any unrecognized template
        console.warn(`Unknown template "${template}", falling back to grid`);
        return <GridTemplate artworks={artworks} onArtworkView={handleArtworkView} />;
    }
  };

  // Get artist info with proper fallbacks
  const artistInfo = {
    name: portfolio.profiles?.full_name || portfolio.profiles?.username || 'Artist',
    id: portfolio.user_id || ''
  };

  return (
    <DefaultLayout>
      <div className={`min-h-screen ${getThemeStyles()}`}>
        <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
          <div className="mb-6 md:mb-8">
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link to="/portfolios">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolios
              </Link>
            </Button>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{portfolio.name || 'Untitled Portfolio'}</h1>
            
            {portfolio.description && (
              <p className="text-md md:text-lg mb-4 max-w-3xl">{portfolio.description}</p>
            )}
            
            {artistInfo.id && (
              <div className="flex items-center">
                <Link 
                  to={`/user/${artistInfo.id}`} 
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  {artistInfo.name}
                </Link>
              </div>
            )}
          </div>
          
          {/* Render the appropriate template based on portfolio settings */}
          <div className="mb-8">
            {renderTemplate()}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PortfolioDetail;
