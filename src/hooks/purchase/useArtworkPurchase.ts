
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OrderStatus } from '@/types/portfolio';
import { useAnalytics } from '@/hooks/analytics';

export const useArtworkPurchase = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackPurchaseComplete } = useAnalytics();
  
  const purchaseArtwork = async (artworkId: string) => {
    if (!user) {
      toast.error('You must be logged in to make a purchase');
      navigate('/sign-in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get the artwork details to make sure it's valid and for sale
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .select('id, title, price, currency, for_sale, sold_out, portfolio_id')
        .eq('id', artworkId)
        .single();
      
      if (artworkError || !artwork) {
        throw new Error('Artwork not found');
      }
      
      if (!artwork.for_sale) {
        throw new Error('This artwork is not for sale');
      }
      
      if (artwork.sold_out) {
        throw new Error('This artwork is sold out');
      }
      
      // Call the Stripe payment edge function to create a checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          buyerId: user.id,
          successUrl: `${window.location.origin}/payment/confirmation`,
          cancelUrl: `${window.location.origin}/payment/canceled`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }
      
      const { sessionUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
      
    } catch (error: any) {
      console.error('Error initiating purchase:', error);
      toast.error(error.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };
  
  const loadOrderHistory = async (status: OrderStatus = 'all') => {
    if (!user) return [];
    
    setLoadingOrders(true);
    setSelectedStatus(status);
    
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          artwork_id,
          amount,
          currency,
          status,
          created_at,
          artworks:artwork_id (
            id,
            title,
            image_url,
            portfolios:portfolio_id (
              id,
              name,
              profiles:user_id (
                username,
                full_name
              )
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      
      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setOrders(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading order history:', error);
      toast.error('Failed to load order history');
      return [];
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const verifyPayment = async (orderId: string, sessionId: string) => {
    if (!orderId || !sessionId) {
      return { success: false, message: 'Missing order information' };
    }
    
    try {
      // Get the order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          amount, 
          currency,
          artwork_id,
          stripe_session_id,
          artworks:artwork_id (
            id,
            title,
            image_url,
            portfolio_id,
            portfolios:portfolio_id (
              id,
              name,
              user_id,
              profiles:user_id (
                username,
                full_name
              )
            )
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (orderError || !order) {
        throw new Error('Order not found');
      }
      
      // Verify the session ID matches
      if (order.stripe_session_id !== sessionId) {
        throw new Error('Invalid session ID');
      }
      
      // Track the purchase completion in analytics if it was successful
      if (order.status === 'completed' && order.artwork_id) {
        trackPurchaseComplete(
          order.id,
          order.artwork_id,
          order.amount,
          order.currency
        );
      }
      
      return {
        success: true,
        order,
        isCompleted: order.status === 'completed'
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to verify payment' 
      };
    }
  };
  
  return {
    purchaseArtwork,
    isProcessing,
    loadOrderHistory,
    orders,
    loadingOrders,
    selectedStatus,
    setSelectedStatus,
    verifyPayment
  };
};
