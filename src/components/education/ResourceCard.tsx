
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Video, FileText, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toggleFavoriteResource } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceCardProps {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  imageUrl: string;
  author: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, newState: boolean) => void;
}

const ResourceCard = ({
  id,
  title,
  type,
  category,
  imageUrl,
  author,
  isFavorite = false,
  onFavoriteToggle
}: ResourceCardProps) => {
  const { user } = useAuth();
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);
  
  const iconMap = {
    'article': <Book className="h-5 w-5" />,
    'video': <Video className="h-5 w-5" />,
    'guide': <FileText className="h-5 w-5" />,
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    setFavoriteLoading(true);
    
    try {
      const success = await toggleFavoriteResource(id, user.id, isFavorite);
      
      if (success) {
        // Update UI state via the parent component
        if (onFavoriteToggle) {
          onFavoriteToggle(id, !isFavorite);
        }
        
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        throw new Error('Failed to update favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Card className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
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
        
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
          {type in iconMap ? iconMap[type as keyof typeof iconMap] : null}
          <span className="ml-1">{type}</span>
        </div>
        
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-3 right-3 rounded-full p-2 hover:bg-white/80",
              isFavorite 
                ? "bg-white text-yellow-500" 
                : "bg-white/60 text-gray-400 hover:text-yellow-500"
            )}
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
          >
            <Star className={cn("h-5 w-5", isFavorite ? "fill-yellow-500" : "")} />
            <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
          </Button>
        )}
      </div>
      
      <div className="p-4">
        <div className="text-xs font-medium text-muted-foreground mb-1">{category}</div>
        <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">By {author}</p>
      </div>
    </Card>
  );
};

export default ResourceCard;
