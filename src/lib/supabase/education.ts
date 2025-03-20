
import { supabase } from './client';

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

export const getEducationCategories = async () => {
  const { data, error } = await supabase
    .from('education_resources')
    .select('category');
    
  if (error) {
    console.error('Error fetching education categories:', error);
    return [];
  }
  
  // Handle duplicates in code instead of using .distinct()
  const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
  return uniqueCategories;
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
      .select()
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
