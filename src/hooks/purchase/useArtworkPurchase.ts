
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types/portfolio';

export const useArtworkPurchase = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  /**
   * Initiates the purchase process for an artwork
   * @param artworkId - The ID of the artwork to purchase
   * @returns The payment session data or null if the process fails
   */
  const purchaseArtwork = async (artworkId: string) => {
    if (!user) {
      toast.error('You must be logged in to purchase artwork');
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      // Get the user session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication error. Please log in again.');
        return null;
      }
      
      // Determine the success and cancel URLs
      const successUrl = `${window.location.origin}/dashboard?tab=orders`;
      const cancelUrl = window.location.href;
      
      // Call the Stripe payment function
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          artworkId,
          buyerId: user.id,
          successUrl,
          cancelUrl
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to Stripe checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return data;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error purchasing artwork:', error);
      toast.error('Failed to process payment. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Fetches the order history for the current user
   */
  const loadOrderHistory = async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    
    setLoadingOrders(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          artworks:artwork_id (
            id,
            title,
            image_url,
            price,
            currency,
            portfolio_id,
            portfolios:portfolio_id (
              id,
              name,
              user_id,
              profiles:user_id (
                id,
                username,
                full_name
              )
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  return {
    purchaseArtwork,
    loadOrderHistory,
    orders,
    loadingOrders,
    isProcessing
  };
};
