
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to fetch user profile');
    return createErrorResponse(
      'Failed to fetch user profile', 
      error
    );
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to fetch user by username');
    return createErrorResponse(
      'Failed to fetch user by username', 
      error
    );
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: any): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to update user profile');
    return createErrorResponse(
      'Failed to update user profile', 
      error
    );
  }
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<ApiResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return createSuccessResponse(publicUrl);
  } catch (error) {
    handleApiError(error, 'Failed to upload avatar');
    return createErrorResponse(
      'Failed to upload avatar', 
      error
    );
  }
}

/**
 * Upload user banner image
 */
export async function uploadUserBanner(file: File, userId: string): Promise<ApiResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/banner.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('avatars') // Using the same bucket as avatars for simplicity
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update user profile with banner URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ banner_image_url: publicUrl })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return createSuccessResponse(publicUrl);
  } catch (error) {
    handleApiError(error, 'Failed to upload banner');
    return createErrorResponse(
      'Failed to upload banner', 
      error
    );
  }
}
