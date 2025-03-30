
import React, { useEffect, useState } from 'react';
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
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, specialty, imageUrl, userId, delay }) => {
  return (
    <div 
      className={cn(
        "group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200",
        "transform transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        `animate-fade-up animate-delay-${delay * 100}`
      )}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!imageUrl && (
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
          <Link to={`/user/${userId}`}>
            View Profile
          </Link>
        </Button>
      </div>
    </div>
  );
};

const FeaturedArtists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        
        // Fetch artists from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, bio, avatar_url')
          .not('full_name', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
          throw error;
        }
        
        console.log('Fetched artists:', data);
        
        // Create an array of artists with mapped data
        const artistData = data ? data.map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.username || 'Artist',
          specialty: profile.bio ? profile.bio.substring(0, 30) + (profile.bio.length > 30 ? '...' : '') : 'Artist',
          imageUrl: profile.avatar_url || '',
          userId: profile.id
        })) : [];
        
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

  // Fallback data in case there are no artists in the database
  const fallbackArtists = [
    { id: "1", name: "Alex Riviera", specialty: "Digital Illustration", imageUrl: "", userId: "1" },
    { id: "2", name: "Sophia Chen", specialty: "Pixel Art", imageUrl: "", userId: "2" },
    { id: "3", name: "Marcus Johnson", specialty: "3D Modeling", imageUrl: "", userId: "3" },
    { id: "4", name: "Naomi Wright", specialty: "Traditional Painting", imageUrl: "", userId: "4" },
  ];

  const displayArtists = artists.length > 0 ? artists : fallbackArtists;

  return (
    <section className="py-24 bg-gray-50">
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
                delay={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArtists;
