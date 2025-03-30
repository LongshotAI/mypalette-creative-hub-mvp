
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

interface EducationResource {
  id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  author: string;
  external_url?: string;
  image_url?: string;
  is_published: boolean;
  content?: string;
}

/**
 * Get education resources with filters
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
 * Get all education resources (including unpublished) for admin
 */
export async function getAdminEducationResources(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('education_resources')
      .select('*')
      .order('created_at', { ascending: false });
    
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
 * Get a single education resource by ID
 */
export async function getEducationResource(id: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('education_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to fetch education resource');
    return createErrorResponse(
      'Failed to fetch education resource', 
      error
    );
  }
}

/**
 * Create new education resource
 */
export async function createEducationResource(resource: EducationResource): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('education_resources')
      .insert([resource])
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to create education resource');
    return createErrorResponse(
      'Failed to create education resource', 
      error
    );
  }
}

/**
 * Update existing education resource
 */
export async function updateEducationResource(id: string, updates: Partial<EducationResource>): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('education_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to update education resource');
    return createErrorResponse(
      'Failed to update education resource', 
      error
    );
  }
}

/**
 * Delete education resource
 */
export async function deleteEducationResource(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('education_resources')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to delete education resource');
    return createErrorResponse(
      'Failed to delete education resource', 
      error
    );
  }
}

/**
 * Toggle favorite status for a resource
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
    const { data, error } = await supabase
      .from('education_favorites')
      .select('resource_id')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    const favoriteIds = data.map(fav => fav.resource_id);
    
    return createSuccessResponse(favoriteIds);
  } catch (error) {
    handleApiError(error, 'Failed to fetch favorite resources');
    return createErrorResponse(
      'Failed to fetch favorite resources', 
      error
    );
  }
}

/**
 * Get education resources by favorite status
 */
export async function getFavoriteResources(userId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data: favorites, error: favError } = await supabase
      .from('education_favorites')
      .select('resource_id')
      .eq('user_id', userId);
      
    if (favError) throw favError;
    
    if (favorites.length === 0) {
      return createSuccessResponse([]);
    }
    
    const favoriteIds = favorites.map(fav => fav.resource_id);
    
    const { data, error } = await supabase
      .from('education_resources')
      .select('*')
      .in('id', favoriteIds)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch favorite resources');
    return createErrorResponse(
      'Failed to fetch favorite resources', 
      error
    );
  }
}
