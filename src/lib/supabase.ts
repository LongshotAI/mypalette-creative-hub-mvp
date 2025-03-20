
import { createClient } from '@supabase/supabase-js';
import { AdminType } from '@/types/admin';

// Use the correct Supabase URL and anon key from the client.ts file
const supabaseUrl = 'https://xlkypscosuhkuzidgpcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsa3lwc2Nvc3Voa3V6aWRncGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjIyOTEsImV4cCI6MjA1Nzk5ODI5MX0.cczvYnlHt0dI4K6GR0_JfoXVUPKFec9ATnrpmyoqaFk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper to check if Supabase is configured correctly
export const isSupabaseConfigured = () => {
  return true; // Now properly configured with actual credentials
};

// Helper functions for user profiles
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

// Helper for fetching user portfolios
export const getUserPortfolios = async (userId: string) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user portfolios:', error);
    return [];
  }
  
  return data;
};

// Helper for fetching portfolio artworks
export const getPortfolioArtworks = async (portfolioId: string) => {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching portfolio artworks:', error);
    return [];
  }
  
  return data;
};

// Upload artwork image to storage
export const uploadArtworkImage = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('artworks')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) {
    console.error('Error uploading artwork:', error);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);
  
  return publicUrl;
};

// Helper for fetching education resources with search
export const getEducationResources = async (search: string = '', category: string = '') => {
  let query = supabase
    .from('education_resources')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching education resources:', error);
    return [];
  }
  
  return data;
};

// Toggle favorite status for education resources
export const toggleFavoriteResource = async (resourceId: string, userId: string, isFavorite: boolean) => {
  if (isFavorite) {
    // Remove favorite
    const { error } = await supabase
      .from('education_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId);
      
    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  } else {
    // Add favorite
    const { error } = await supabase
      .from('education_favorites')
      .insert([{ user_id: userId, resource_id: resourceId }]);
      
    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }
  
  return true;
};

// Get user's favorite resources
export const getUserFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('education_favorites')
    .select('resource_id')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  return data.map(fav => fav.resource_id);
};

// Helper for fetching open calls with filters
export const getOpenCalls = async (status: string = 'all', sort: string = 'deadline') => {
  let query = supabase
    .from('open_calls')
    .select('*');
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  // Apply sorting
  if (sort === 'deadline') {
    query = query.order('deadline', { ascending: true });
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'popularity') {
    query = query.order('popularity', { ascending: false });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching open calls:', error);
    return [];
  }
  
  return data;
};

// Get user's open call submissions
export const getUserSubmissions = async (userId: string) => {
  const { data, error } = await supabase
    .from('open_call_submissions')
    .select(`
      *,
      open_calls (*)
    `)
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  return data;
};

// Submit application to open call
export const submitOpenCallApplication = async (openCallId: string, userId: string, formData: any) => {
  const { error } = await supabase
    .from('open_call_submissions')
    .insert([{ 
      open_call_id: openCallId,
      user_id: userId,
      status: 'submitted',
      submission_data: formData
    }]);
    
  if (error) {
    console.error('Error submitting application:', error);
    return false;
  }
  
  return true;
};

// Admin-related functions
export const checkAdminStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('admin_type')
    .eq('id', userId)
    .single();
    
  if (error || !data) {
    console.error('Error checking admin status:', error);
    return null;
  }
  
  return data.admin_type;
};

export const getAllAdmins = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, admin_type, full_name, created_at')
    .not('admin_type', 'is', null)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
  
  // Get emails from auth.users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 100,
  });
  
  if (usersError || !users) {
    console.error('Error fetching user emails:', usersError);
    return data.map(admin => ({
      ...admin,
      email: 'Unknown'
    }));
  }
  
  // Map emails to admin records
  const adminWithEmails = data.map(admin => {
    const user = users.users.find(u => u.id === admin.id);
    return {
      ...admin,
      email: user?.email || 'Unknown'
    };
  });
  
  return adminWithEmails;
};

export const updateAdminRole = async (userId: string, adminType: AdminType) => {
  const { error } = await supabase
    .from('profiles')
    .update({ admin_type: adminType })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating admin role:', error);
    return false;
  }
  
  return true;
};

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

export const getAllSubmissions = async () => {
  const { data, error } = await supabase
    .from('open_call_submissions')
    .select('*, open_calls(title)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  // Fetch user emails
  const enrichedSubmissions = await Promise.all(data.map(async (submission) => {
    const { data: userData } = await supabase.auth.admin.getUserById(submission.user_id);
    
    return {
      ...submission,
      user_email: userData?.user?.email || 'Unknown',
      open_call_title: submission.open_calls?.title || 'Unknown'
    };
  }));
  
  return enrichedSubmissions;
};

export const updateSubmissionStatus = async (submissionId: string, status: string, feedback: string | null = null) => {
  const { error } = await supabase
    .from('open_call_submissions')
    .update({ 
      status, 
      feedback,
      updated_at: new Date().toISOString() 
    })
    .eq('id', submissionId);
    
  if (error) {
    console.error('Error updating submission status:', error);
    return false;
  }
  
  return true;
};

export const createOrUpdateEducationResource = async (resource: any) => {
  if (resource.id) {
    // Update
    const { error } = await supabase
      .from('education_resources')
      .update({
        title: resource.title,
        description: resource.description,
        content: resource.content,
        category: resource.category,
        type: resource.type,
        author: resource.author,
        image_url: resource.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', resource.id);
      
    if (error) {
      console.error('Error updating education resource:', error);
      return null;
    }
    
    return resource.id;
  } else {
    // Create
    const { data, error } = await supabase
      .from('education_resources')
      .insert([{
        title: resource.title,
        description: resource.description,
        content: resource.content,
        category: resource.category,
        type: resource.type,
        author: resource.author,
        image_url: resource.image_url
      }])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating education resource:', error);
      return null;
    }
    
    return data.id;
  }
};

export const deleteEducationResource = async (resourceId: string) => {
  const { error } = await supabase
    .from('education_resources')
    .delete()
    .eq('id', resourceId);
    
  if (error) {
    console.error('Error deleting education resource:', error);
    return false;
  }
  
  return true;
};

export const getEducationCategories = async () => {
  const { data, error } = await supabase
    .from('education_resources')
    .select('category')
    .distinct();
    
  if (error) {
    console.error('Error fetching education categories:', error);
    return [];
  }
  
  return data.map(item => item.category);
};
