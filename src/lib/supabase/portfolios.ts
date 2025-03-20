
import { supabase } from './client';

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
