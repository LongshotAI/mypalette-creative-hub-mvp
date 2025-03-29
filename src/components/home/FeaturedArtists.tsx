import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ArtistCardProps {
  name: string;
  specialty: string;
  imageUrl: string;
  userId: string;
  delay: number;
  portfolioId?: string;
  parallaxFactor?: number;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, specialty, imageUrl, userId, delay, portfolioId, parallaxFactor = 1 }) => {
  const [artworkImageUrl, setArtworkImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchArtistArtwork = async () => {
      if (portfolioId) {
        try {
          // Fetch one artwork from artist's portfolio to use as a background
          const { data, error } = await supabase
            .from('artworks')
            .select('image_url')
            .eq('portfolio_id', portfolioId)
            .limit(1)
            .maybeSingle();
          
          if (!error && data?.image_url) {
            setArtworkImageUrl(data.image_url);
          }
        } catch (error) {
          console.error('Error fetching artist artwork:', error);
        }
      }
    };
    
    fetchArtistArtwork();
  }, [portfolioId]);
  
  // Use artwork image if available, otherwise use provided imageUrl
  const displayImageUrl = artworkImageUrl || imageUrl;
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200",
        "transform transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        `animate-fade-up animate-delay-${delay * 100}`
      )}
      style={{
        transform: parallaxFactor !== 1 ? `translateY(${parallaxFactor}px)` : undefined,
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: displayImageUrl ? `url(${displayImageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!displayImageUrl && (
            <span className="text-gray-400">Image placeholder</span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-base">{name}</h3>
        <p className="text-sm text-muted-foreground">{specialty || 'Artist'}</p>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white text-black" asChild>
          <Link to={portfolioId ? `/portfolio/${portfolioId}` : `/user/${userId}`}>
            View {portfolioId ? 'Portfolio' : 'Profile'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Sample images from Unsplash for fallback purposes
const sampleArtworks = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613989668327-fc08ea519c09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602532305019-3dbbd482dae9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1637847999747-6efb359e49f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
];

// Define interface for profile data
interface ProfileData {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

// Define interface for portfolio with profile
interface PortfolioWithProfile {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  profiles: ProfileData;
  artwork?: {
    id: string;
    image_url: string;
  } | null;
}

const FeaturedArtists: React.FC<{ scrollPosition?: number }> = ({ scrollPosition = 0 }) => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // First, fetch public portfolios
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from('portfolios')
          .select(`
            id,
            name,
            user_id,
            is_public,
            profiles:user_id (
              id, 
              full_name, 
              username, 
              bio, 
              avatar_url
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(12);
        
        if (portfoliosError) {
          throw portfoliosError;
        }
        
        console.log('Fetched portfolios:', portfoliosData);
        
        // Filter portfolios to make sure they have associated profile data
        const validPortfolios = (portfoliosData?.filter(p => p.profiles) || []) as PortfolioWithProfile[];
        
        // Fetch at least one artwork for each portfolio to display
        const portfoliosWithArtwork = await Promise.all(
          validPortfolios.map(async (portfolio) => {
            try {
              const { data, error } = await supabase
                .from('artworks')
                .select('id, image_url')
                .eq('portfolio_id', portfolio.id)
                .limit(1)
                .maybeSingle();
                
              return {
                ...portfolio,
                artwork: !error && data ? data : null
              };
            } catch (e) {
              console.error('Error fetching artwork for portfolio', portfolio.id, e);
              return {
                ...portfolio,
                artwork: null
              };
            }
          })
        );
        
        // Filter out portfolios without artwork
        const portfoliosWithData = portfoliosWithArtwork.filter(p => p.artwork);
        
        // Create an array of artists with mapped data
        const artistData = portfoliosWithData.slice(0, 8).map((portfolio, index) => {
          if (!portfolio.profiles) {
            return {
              id: `temp-${index}`,
              name: portfolio.name || 'Artist',
              specialty: 'Digital Artist',
              imageUrl: portfolio.artwork?.image_url || sampleArtworks[index % sampleArtworks.length],
              userId: portfolio.user_id,
              portfolioId: portfolio.id
            };
          }

          return {
            id: portfolio.profiles.id || `temp-${index}`,
            name: portfolio.profiles.full_name || portfolio.profiles.username || portfolio.name || 'Artist',
            specialty: portfolio.profiles.bio ? 
              portfolio.profiles.bio.substring(0, 30) + (portfolio.profiles.bio.length > 30 ? '...' : '') : 
              'Digital Artist',
            imageUrl: portfolio.artwork?.image_url || 
                    portfolio.profiles.avatar_url || 
                    sampleArtworks[index % sampleArtworks.length],
            userId: portfolio.profiles.id || portfolio.user_id,
            portfolioId: portfolio.id
          };
        });
        
        setArtists(artistData);
      } catch (error) {
        console.error('Error fetching artists:', error);
        toast.error('Failed to load featured artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Check if section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Fallback data in case there are no artists in the database
  const fallbackArtists = [
    { id: "1", name: "Alex Riviera", specialty: "Digital Illustration", imageUrl: sampleArtworks[0], userId: "1" },
    { id: "2", name: "Sophia Chen", specialty: "Pixel Art", imageUrl: sampleArtworks[1], userId: "2" },
    { id: "3", name: "Marcus Johnson", specialty: "3D Modeling", imageUrl: sampleArtworks[2], userId: "3" },
    { id: "4", name: "Naomi Wright", specialty: "Traditional Painting", imageUrl: sampleArtworks[3], userId: "4" },
    { id: "5", name: "Jordan Blake", specialty: "Digital Collage", imageUrl: sampleArtworks[4], userId: "5" },
    { id: "6", name: "Emma Liu", specialty: "Vector Art", imageUrl: sampleArtworks[5], userId: "6" },
    { id: "7", name: "Carlos Rodriguez", specialty: "Abstract Digital", imageUrl: sampleArtworks[6], userId: "7" },
    { id: "8", name: "Aisha Khan", specialty: "Generative Art", imageUrl: sampleArtworks[7], userId: "8" }
  ];

  const displayArtists = artists.length > 0 ? artists : fallbackArtists;

  // Calculate parallax effect based on scroll position and visibility
  const calculateParallaxFactor = (index: number): number => {
    if (!isVisible) return 0;
    
    // Create a staggered effect based on column position
    const columnPosition = index % 4; // For a 4-column grid
    const rowPosition = Math.floor(index / 4);
    
    // Different parallax speeds based on column position
    const baseFactors = [0.15, 0.2, 0.25, 0.3];
    const speedFactor = baseFactors[columnPosition] || 0.2;
    
    // Add slight variation based on row
    const rowVariation = rowPosition * 0.05;
    
    // Calculate final parallax offset
    return (scrollPosition * (speedFactor + rowVariation)) * (columnPosition % 2 === 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight mb-3 animate-fade-up">Featured Artists</h2>
            <p className="text-muted-foreground animate-fade-up animate-delay-100">
              Discover exceptional talent from around the world showcasing their work on MyPalette.
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            className="mt-4 md:mt-0 group animate-fade-up animate-delay-200"
            asChild
          >
            <Link to="/portfolios">
              <span>View all artists</span>
              <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayArtists.map((artist, index) => (
              <ArtistCard 
                key={artist.id} 
                name={artist.name} 
                specialty={artist.specialty} 
                imageUrl={artist.imageUrl}
                userId={artist.userId}
                portfolioId={artist.portfolioId}
                delay={index + 1}
                parallaxFactor={calculateParallaxFactor(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArtists;
