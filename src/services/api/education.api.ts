
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

/**
 * Get education resources with search and filters
 */
export async function getEducationResources(
  searchQuery: string = '',
  resourceType: string = 'all',
  category: string = 'all'
): Promise<ApiResponse<any[]>> {
  try {
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
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch education resources');
    return createErrorResponse(
      'Failed to fetch education resources', 
      error
    );
  }
}

/**
 * Toggle favorite status for education resources
 */
export async function toggleFavoriteResource(
  resourceId: string, 
  userId: string, 
  isFavorite: boolean
): Promise<ApiResponse<boolean>> {
  try {
    if (isFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('education_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId);
        
      if (error) throw error;
    } else {
      // Add favorite
      const { error } = await supabase
        .from('education_favorites')
        .insert([{ user_id: userId, resource_id: resourceId }]);
        
      if (error) throw error;
    }
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to update favorite status');
    return createErrorResponse(
      'Failed to update favorite status', 
      error
    );
  }
}

/**
 * Get user's favorite resources
 */
export async function getUserFavorites(userId: string): Promise<ApiResponse<string[]>> {
  try {
    if (!userId) return createSuccessResponse([]);
    
    const { data, error } = await supabase
      .from('education_favorites')
      .select('resource_id')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return createSuccessResponse(data.map(fav => fav.resource_id));
  } catch (error) {
    handleApiError(error, 'Failed to fetch favorites');
    return createErrorResponse(
      'Failed to fetch favorites', 
      error
    );
  }
}
