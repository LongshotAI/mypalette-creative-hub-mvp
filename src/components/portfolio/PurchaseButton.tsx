
import React from 'react';
import { Button } from '@/components/ui/button';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Loader2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Artwork } from '@/types/portfolio';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/analytics';

interface PurchaseButtonProps {
  artwork: Artwork;
  className?: string;
}

/**
 * PurchaseButton component displays a button for purchasing artwork.
 * Handles various states including:
 * - User authentication
 * - Purchase processing
 * - Sold out status
 * - Artist's own artwork (cannot purchase)
 */
const PurchaseButton: React.FC<PurchaseButtonProps> = ({ artwork, className }) => {
  const { user } = useAuth();
  const { purchaseArtwork, isProcessing } = useArtworkPurchase();
  const { trackCheckoutStart } = useAnalytics();
  const navigate = useNavigate();
  
  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: artwork.currency || 'USD',
    minimumFractionDigits: 2,
  }).format(artwork.price || 0);
  
  const handlePurchase = async () => {
    if (!user) {
      // Redirect to login page with a return URL
      navigate(`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Check if the artwork belongs to the current user
    if (artwork.portfolios && artwork.portfolios.user_id === user.id) {
      toast.error("You cannot purchase your own artwork");
      return;
    }
    
    // Track checkout initiation in analytics
    if (artwork.id && artwork.portfolio_id) {
      trackCheckoutStart(artwork.id, artwork.price || 0, artwork.currency || 'USD');
    }
    
    await purchaseArtwork(artwork.id);
  };
  
  // Don't render the button if the artwork is not for sale or has no price
  if (!artwork.for_sale || !artwork.price) {
    return null;
  }
  
  // If the artwork is sold out, show a disabled button
  if (artwork.sold_out) {
    return (
      <Button 
        className={className}
        disabled
        variant="secondary"
        size="sm"
        aria-label="Artwork sold out"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Sold Out
      </Button>
    );
  }
  
  // If the artwork belongs to the current user, show a disabled button
  if (user && artwork.portfolios && artwork.portfolios.user_id === user.id) {
    return (
      <Button 
        className={className}
        disabled
        variant="outline"
        size="sm"
        aria-label="This is your artwork"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Your Artwork
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={handlePurchase} 
      className={className}
      disabled={isProcessing}
      size="sm"
      aria-label={`Purchase artwork for ${formattedPrice}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase for {formattedPrice}
        </>
      )}
    </Button>
  );
};

export default PurchaseButton;
