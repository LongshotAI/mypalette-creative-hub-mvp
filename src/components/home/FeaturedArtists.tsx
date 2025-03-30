// Import React and required components
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedLink } from '@/components/ui/AnimatedLink';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { GlareCard } from '@/components/ui/glare-card';
import { toast } from 'sonner';

// Define types for the API responses
interface ProfileData {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface PortfolioWithProfile {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  profile: ProfileData;
}

interface ArtworkData {
  id: string;
  title: string;
  image_url: string;
  portfolio_id: string;
}

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<PortfolioWithProfile[]>([]);
  const [artworks, setArtworks] = useState<Record<string, ArtworkData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      // Get public portfolios first
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('id, is_public')
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;

      // For each portfolio, get the user profile and a sample artwork
      const portfoliosWithProfiles: PortfolioWithProfile[] = [];
      const artworksMap: Record<string, ArtworkData> = {};

      // Process portfolios sequentially to avoid race conditions
      for (const portfolio of portfolios) {
        try {
          // Get portfolio details
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolios')
            .select('id, name, user_id, is_public')
            .eq('id', portfolio.id)
            .single();

          if (portfolioError) continue;

          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url')
            .eq('id', portfolioData.user_id)
            .single();

          if (profileError) continue;

          // Combined data
          portfoliosWithProfiles.push({
            ...portfolioData,
            profile: profileData
          });

          // Get a sample artwork
          const { data: artworkData, error: artworkError } = await supabase
            .from('artworks')
            .select('id, title, image_url, portfolio_id')
            .eq('portfolio_id', portfolio.id)
            .limit(1)
            .single();

          if (!artworkError && artworkData) {
            artworksMap[portfolio.id] = artworkData;
          }
        } catch (err) {
          console.error('Error processing portfolio:', err);
        }
      }

      setArtists(portfoliosWithProfiles);
      setArtworks(artworksMap);
    } catch (err) {
      console.error('Error fetching artists:', err);
      toast.error('Failed to load featured artists');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Artists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          // Display skeleton loaders while loading
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full rounded-md mb-4" />
                <div className="flex items-center space-x-4 mb-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Display featured artists
          artists.map((artist) => (
            <GlareCard key={artist.id}>
              <CardContent className="p-4">
                {artworks[artist.id]?.image_url ? (
                  <img
                    src={artworks[artist.id]?.image_url}
                    alt={artworks[artist.id]?.title || 'Artwork'}
                    className="object-cover w-full h-40 rounded-md mb-4"
                  />
                ) : (
                  <Skeleton className="h-40 w-full rounded-md mb-4" />
                )}
                <div className="flex items-center space-x-4 mb-2">
                  <Avatar>
                    {artist.profile?.avatar_url ? (
                      <AvatarImage src={artist.profile?.avatar_url} alt={artist.profile?.full_name || 'Avatar'} />
                    ) : (
                      <AvatarFallback>{artist.profile?.full_name?.charAt(0) || artist.profile?.username?.charAt(0) || '?'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{artist.profile?.full_name || artist.profile?.username || 'Unknown'}</h3>
                    <p className="text-sm text-muted-foreground">{artist.profile?.bio?.substring(0, 50) || 'No bio available'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <AnimatedLink to={`/user/${artist.profile?.id}`}>
                  <Button className="w-full">View Profile</Button>
                </AnimatedLink>
              </CardFooter>
            </GlareCard>
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturedArtists;
