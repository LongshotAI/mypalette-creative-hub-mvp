
import React from 'react';
import { Artwork } from '@/types/portfolio';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArtworkDetailModal = ({ artwork, open, onOpenChange }: ArtworkDetailModalProps) => {
  if (!artwork) return null;

  const shareArtwork = async () => {
    // Create the share data
    const shareData = {
      title: `Artwork: ${artwork.title}`,
      text: `Check out this artwork: ${artwork.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCurrency = (price: number | null, currency: string) => {
    if (price === null) return '';
    
    switch (currency) {
      case 'USD':
        return `$${price}`;
      case 'EUR':
        return `€${price}`;
      case 'GBP':
        return `£${price}`;
      case 'JPY':
        return `¥${price}`;
      case 'ETH':
        return `Ξ ${price}`;
      default:
        return `${price} ${currency}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{artwork.title}</DialogTitle>
          {artwork.for_sale && artwork.price !== null && (
            <DialogDescription className="text-primary font-medium text-lg">
              {formatCurrency(artwork.price, artwork.currency)}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-md overflow-hidden">
            <img 
              src={artwork.image_url} 
              alt={artwork.title}
              className="w-full h-auto object-contain max-h-[60vh]"
            />
          </div>
          
          {artwork.description && (
            <div className="text-muted-foreground">
              {artwork.description}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              {artwork.for_sale && (
                <Button>Contact to Purchase</Button>
              )}
            </div>
            
            <Button variant="outline" size="icon" onClick={shareArtwork}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkDetailModal;
