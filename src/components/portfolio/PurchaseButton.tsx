
import React from 'react';
import { Button } from '@/components/ui/button';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Artwork } from '@/types/portfolio';
import { useNavigate } from 'react-router-dom';

interface PurchaseButtonProps {
  artwork: Artwork;
  className?: string;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ artwork, className }) => {
  const { user } = useAuth();
  const { purchaseArtwork, isProcessing } = useArtworkPurchase();
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
    
    await purchaseArtwork(artwork.id);
  };
  
  if (!artwork.for_sale || !artwork.price) {
    return null;
  }
  
  return (
    <Button 
      onClick={handlePurchase} 
      className={className}
      disabled={isProcessing}
      size="sm"
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
