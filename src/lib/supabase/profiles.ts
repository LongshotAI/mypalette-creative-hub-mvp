
import { supabase } from './client';

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

// Helper to check if the provided email is our "King Admin"
export const isKingAdminEmail = (email: string) => {
  return email === 'pixelpalettenation@gmail.com';
};
