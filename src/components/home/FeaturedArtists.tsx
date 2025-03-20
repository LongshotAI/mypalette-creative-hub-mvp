
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ArtistCardProps {
  name: string;
  specialty: string;
  imageUrl: string;
  delay: number;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, specialty, imageUrl, delay }) => {
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
        <p className="text-sm text-muted-foreground">{specialty}</p>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white text-black" asChild>
          <Link to="/portfolios">
            View Portfolio
          </Link>
        </Button>
      </div>
    </div>
  );
};

const FeaturedArtists: React.FC = () => {
  const artists = [
    { name: "Alex Riviera", specialty: "Digital Illustration", imageUrl: "" },
    { name: "Sophia Chen", specialty: "Pixel Art", imageUrl: "" },
    { name: "Marcus Johnson", specialty: "3D Modeling", imageUrl: "" },
    { name: "Naomi Wright", specialty: "Traditional Painting", imageUrl: "" },
  ];

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <ArtistCard 
              key={artist.name} 
              name={artist.name} 
              specialty={artist.specialty} 
              imageUrl={artist.imageUrl}
              delay={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
