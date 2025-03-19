
import { createClient } from '@supabase/supabase-js';

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
export const getEducationResources = async (search: string = '') => {
  let query = supabase
    .from('education_resources')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
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
export const getOpenCalls = async (status: string = 'all') => {
  let query = supabase
    .from('open_calls')
    .select('*')
    .order('deadline', { ascending: true });
  
  if (status !== 'all') {
    query = query.eq('status', status);
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
