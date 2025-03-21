
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types/portfolio';
import { useAnalytics } from '@/hooks/analytics';

export const useArtworkPurchase = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const { trackConversion, trackInteraction } = useAnalytics();

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
      // Track the start of the purchase process
      trackConversion('purchase_initiated', { artwork_id: artworkId });
      
      // Get the user session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication error. Please log in again.');
        return null;
      }
      
      // Check if artwork is already purchased by this user
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('artwork_id', artworkId)
        .eq('status', 'completed');
      
      if (existingOrders && existingOrders.length > 0) {
        toast.info('You have already purchased this artwork');
        trackInteraction('purchase_button', 'already_purchased', { artwork_id: artworkId });
        setIsProcessing(false);
        return null;
      }
      
      // Check if the artwork is sold out
      const { data: artwork } = await supabase
        .from('artworks')
        .select('sold_out, for_sale, portfolio_id')
        .eq('id', artworkId)
        .single();
      
      // Get the portfolio to check if the current user is the artist
      if (artwork?.portfolio_id) {
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('user_id')
          .eq('id', artwork.portfolio_id)
          .single();
        
        // Prevent artists from buying their own artwork
        if (portfolio && portfolio.user_id === user.id) {
          toast.error('You cannot purchase your own artwork');
          trackInteraction('purchase_button', 'purchase_own_artwork', { artwork_id: artworkId });
          setIsProcessing(false);
          return null;
        }
      }
      
      if (artwork?.sold_out) {
        toast.error('This artwork is sold out');
        trackInteraction('purchase_button', 'purchase_sold_out', { artwork_id: artworkId });
        setIsProcessing(false);
        return null;
      }
      
      if (!artwork?.for_sale) {
        toast.error('This artwork is not for sale');
        trackInteraction('purchase_button', 'purchase_not_for_sale', { artwork_id: artworkId });
        setIsProcessing(false);
        return null;
      }
      
      // Determine the success and cancel URLs
      const successUrl = `${window.location.origin}/payment/confirmation?session_id={CHECKOUT_SESSION_ID}&order_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/payment/confirmation?canceled=true&order_id={CHECKOUT_SESSION_ID}`;
      
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
      
      // Track successful checkout initiation
      trackConversion('checkout_initiated', { 
        artwork_id: artworkId,
        session_id: data.sessionId
      });
      
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
      trackConversion('purchase_failed', { 
        artwork_id: artworkId,
        error: error.message
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Fetches the order history for the current user with optional filtering
   * @param status - Optional status filter (all, pending, completed, failed)
   */
  const loadOrderHistory = async (status: OrderStatus = 'all') => {
    if (!user) {
      setOrders([]);
      return;
    }
    
    setLoadingOrders(true);
    setSelectedStatus(status);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          artworks:artwork_id (
            id,
            title,
            image_url,
            price,
            currency,
            sold_out,
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
      
      // Apply status filter if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
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
  
  /**
   * Loads orders for a specific artwork (for sellers)
   * @param artworkId - The ID of the artwork to get orders for
   */
  const loadArtworkOrders = async (artworkId: string) => {
    if (!user) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:buyer_id (
            username,
            full_name
          )
        `)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching artwork orders:', error);
      toast.error('Failed to load orders for this artwork');
      return [];
    }
  };
  
  /**
   * Get seller's sales history (orders for all artworks in their portfolios)
   */
  const loadSellerOrders = async (status: OrderStatus = 'all') => {
    if (!user) {
      return [];
    }
    
    try {
      // First get all portfolios owned by this user
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);
      
      if (portfolioError || !portfolios.length) {
        return [];
      }
      
      const portfolioIds = portfolios.map(p => p.id);
      
      // Then get all artworks in those portfolios
      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select('id')
        .in('portfolio_id', portfolioIds);
      
      if (artworksError || !artworks.length) {
        return [];
      }
      
      const artworkIds = artworks.map(a => a.id);
      
      // Finally get all orders for those artworks
      let query = supabase
        .from('orders')
        .select(`
          *,
          artworks:artwork_id (
            id,
            title,
            image_url,
            price,
            currency
          ),
          profiles:buyer_id (
            username,
            full_name
          )
        `)
        .in('artwork_id', artworkIds)
        .order('created_at', { ascending: false });
      
      // Apply status filter if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      toast.error('Failed to load sales history');
      return [];
    }
  };

  // Initialize order history when component mounts
  useEffect(() => {
    if (user) {
      loadOrderHistory('all');
    }
  }, [user]);
  
  return {
    purchaseArtwork,
    loadOrderHistory,
    loadArtworkOrders,
    loadSellerOrders,
    orders,
    loadingOrders,
    isProcessing,
    selectedStatus,
    setSelectedStatus
  };
};
