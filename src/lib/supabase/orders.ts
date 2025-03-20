
import { supabase } from './client';

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  // Fetch additional details
  const enrichedOrders = await Promise.all(data.map(async (order) => {
    // Get buyer email
    const { data: userData } = await supabase.auth.admin.getUserById(order.buyer_id);
    
    // Get artwork title
    const { data: artworkData } = await supabase
      .from('artworks')
      .select('title')
      .eq('id', order.artwork_id)
      .single();
      
    return {
      ...order,
      buyer_email: userData?.user?.email || 'Unknown',
      artwork_title: artworkData?.title || 'Unknown'
    };
  }));
  
  return enrichedOrders;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId);
    
  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }
  
  return true;
};
