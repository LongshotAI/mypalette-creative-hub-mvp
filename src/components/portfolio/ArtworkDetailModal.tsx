
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Artwork } from '@/types/portfolio';
import PurchaseButton from './PurchaseButton';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  open,
  onOpenChange,
}) => {
  const { trackArtworkView } = useAnalytics();
  
  // Track artwork view when the modal opens
  useEffect(() => {
    if (open && artwork) {
      trackArtworkView(artwork.id, artwork.portfolio_id);
    }
  }, [open, artwork, trackArtworkView]);

  if (!artwork) return null;

  // Format price with currency if the artwork is for sale
  const formattedPrice = artwork.for_sale && artwork.price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: artwork.currency || 'USD',
        minimumFractionDigits: 2,
      }).format(artwork.price)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">{artwork.title}</DialogTitle>
          {artwork.description && (
            <DialogDescription className="text-sm sm:text-base mt-2">
              {artwork.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="aspect-square w-full overflow-hidden rounded-md">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Details</h3>
              
              {artwork.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="mt-1">{artwork.description}</p>
                </div>
              )}
              
              {formattedPrice && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                  <p className="mt-1 font-semibold text-lg">{formattedPrice}</p>
                </div>
              )}
              
              {artwork.quantity !== undefined && artwork.quantity !== null && artwork.for_sale && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Availability</h4>
                  <p className="mt-1">
                    {artwork.sold_out 
                      ? 'Sold Out' 
                      : `${artwork.quantity} available`}
                  </p>
                </div>
              )}
              
              {artwork.listing_url && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">External Listing</h4>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => window.open(artwork.listing_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Artwork Listing
                  </Button>
                </div>
              )}
            </div>
            
            {artwork.for_sale && artwork.price && (
              <div className="mt-6">
                <PurchaseButton 
                  artwork={artwork} 
                  className="w-full mt-4" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Secure payment processing powered by Stripe. You'll be redirected to complete your purchase.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkDetailModal;
