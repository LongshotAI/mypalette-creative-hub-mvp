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

// Get user by username
export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
  
  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  console.log('Updating user profile:', userId, updates);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    // Fetch the updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching updated profile:', fetchError);
      throw fetchError;
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
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

// Get public portfolios with creator information
export const getPublicPortfolios = async (limit = 10) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching public portfolios:', error);
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

// Get portfolio with user information
export const getPortfolioWithUser = async (portfolioId: string) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        banner_image_url
      )
    `)
    .eq('id', portfolioId)
    .single();
  
  if (error) {
    console.error('Error fetching portfolio with user:', error);
    return null;
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

// Upload user avatar
export const uploadUserAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  // Update user profile with avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating avatar URL:', updateError);
  }
  
  return publicUrl;
};

// Upload user banner image
export const uploadUserBanner = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/banner.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('avatars') // Using the same bucket as avatars for simplicity
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading banner:', error);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  // Update user profile with banner URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ banner_image_url: publicUrl })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating banner URL:', updateError);
  }
  
  return publicUrl;
};

// Helper for fetching education resources with search and filters
export const getEducationResources = async (
  searchQuery: string = '', 
  resourceType: string = 'all',
  category: string = 'all'
) => {
  let query = supabase
    .from('education_resources')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
  }
  
  if (resourceType !== 'all') {
    query = query.eq('type', resourceType);
  }
  
  if (category !== 'all') {
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
  try {
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
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// Get user's favorite resources
export const getUserFavorites = async (userId: string) => {
  if (!userId) return [];
  
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

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    const { count: portfolioCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true });
      
    const { count: artworkCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true });
      
    const { count: educationCount } = await supabase
      .from('education_resources')
      .select('*', { count: 'exact', head: true });
      
    const { count: openCallCount } = await supabase
      .from('open_calls')
      .select('*', { count: 'exact', head: true });
      
    return {
      userCount: userCount || 0,
      portfolioCount: portfolioCount || 0,
      artworkCount: artworkCount || 0,
      educationCount: educationCount || 0,
      openCallCount: openCallCount || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      userCount: 0,
      portfolioCount: 0,
      artworkCount: 0,
      educationCount: 0,
      openCallCount: 0
    };
  }
};

// Get portfolio templates
export const getPortfolioTemplates = async () => {
  const { data, error } = await supabase
    .from('portfolio_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching portfolio templates:', error);
    return [];
  }
  
  return data;
};

// Update portfolio template
export const updatePortfolioTemplate = async (templateId: string, updates: any) => {
  const { data, error } = await supabase
    .from('portfolio_templates')
    .update(updates)
    .eq('id', templateId);
  
  if (error) {
    console.error('Error updating portfolio template:', error);
    return null;
  }
  
  return data;
};

// Add new portfolio template
export const addPortfolioTemplate = async (template: any) => {
  const { data, error } = await supabase
    .from('portfolio_templates')
    .insert([template])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding portfolio template:', error);
    return null;
  }
  
  return data;
};

// Delete portfolio template
export const deletePortfolioTemplate = async (templateId: string) => {
  const { error } = await supabase
    .from('portfolio_templates')
    .delete()
    .eq('id', templateId);
  
  if (error) {
    console.error('Error deleting portfolio template:', error);
    return false;
  }
  
  return true;
};

// Get featured portfolios
export const getFeaturedPortfolios = async (limit = 6) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching featured portfolios:', error);
    return [];
  }
  
  return data;
};
