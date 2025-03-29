
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Video, FileText, Star, ExternalLink, Download, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ResourceCardProps {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  imageUrl: string;
  author: string;
  description?: string;
  externalUrl?: string;
  fileUrl?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const ResourceCard = ({
  id,
  title,
  type,
  category,
  imageUrl,
  author,
  description,
  externalUrl,
  fileUrl,
  isFavorite = false,
  onFavoriteToggle
}: ResourceCardProps) => {
  const { user } = useAuth();
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  
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
      // Update UI via the parent component
      if (onFavoriteToggle) {
        onFavoriteToggle(id, isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleCardClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      setImageOpen(true);
    }
  };

  // Ensure we have a valid image URL
  const displayImageUrl = imageUrl || `https://images.unsplash.com/photo-${1500000000000 + parseInt(id) * 10000}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;

  return (
    <Card 
      className={cn(
        "group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        "cursor-pointer"
      )}
      onClick={handleCardClick}
    >
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: `url(${displayImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="sm" variant="secondary" className="bg-white/80">
              {externalUrl ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Resource
                </>
              ) : (
                <>
                  <Image className="h-4 w-4 mr-2" />
                  View Image
                </>
              )}
            </Button>
          </div>
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
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          {fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur-sm rounded-full h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(fileUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download resource</span>
            </Button>
          )}
          
          {externalUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur-sm rounded-full h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(externalUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open external link</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="text-xs font-medium text-muted-foreground mb-1">{category}</div>
        </div>
        <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">By {author}</p>
      </div>

      {/* Image Dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {category} {type} by {author}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-md">
            <img 
              src={displayImageUrl} 
              alt={title} 
              className="w-full h-auto object-contain max-h-[70vh]" 
            />
          </div>
          {description && (
            <div className="mt-4 text-sm text-muted-foreground">
              {description}
            </div>
          )}
          {externalUrl && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => window.open(externalUrl, '_blank', 'noopener,noreferrer')}
                className="flex items-center"
              >
                Visit Resource <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ResourceCard;
