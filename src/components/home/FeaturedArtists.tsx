
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import AnimatedLink from '@/components/ui/AnimatedLink';
import { supabase } from '@/lib/supabase';
import { PortfolioWithProfile } from '@/types/portfolio';
import { toast } from 'sonner';

interface FeaturedArtistsProps {
  limit?: number;
}

const FeaturedArtists: React.FC<FeaturedArtistsProps> = ({ limit = 6 }) => {
  const [artists, setArtists] = useState<PortfolioWithProfile[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*, user_profiles(full_name, avatar_url)')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          toast.error(`Failed to fetch featured artists: ${error.message}`);
        } else {
          setArtists(data as PortfolioWithProfile[]);
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(err.message || 'An unexpected error occurred');
        toast.error(`An unexpected error occurred: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, [limit]);

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured Artists</h2>
          <AnimatedLink href="/artists" className="hover:underline">
            View All <ArrowRight className="inline-block ml-1 h-4 w-4" />
          </AnimatedLink>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            // Skeleton loaders while loading
            [...Array(limit)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : error ? (
            // Error message if fetching fails
            <div className="text-red-500">{error}</div>
          ) : artists && artists.length > 0 ? (
            // Display featured artists
            artists.map((artist) => (
              <AnimatedLink key={artist.id} href={`/artist/${artist.user_id}`} className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <img src={artist.user_profiles?.avatar_url || "/placeholder-avatar.jpg"} alt={artist.user_profiles?.full_name || "Artist"} className="rounded-full" />
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">{artist.user_profiles?.full_name || 'Unknown Artist'}</h3>
                    <p className="text-sm text-muted-foreground">{artist.title}</p>
                  </div>
                </div>
              </AnimatedLink>
            ))
          ) : (
            // Message if no featured artists are found
            <div className="text-muted-foreground">No featured artists found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedArtists;
