
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) throw error;
    
    return createSuccessResponse(!!data);
  } catch (error) {
    handleApiError(error, 'Failed to verify admin status');
    return createErrorResponse(
      'Failed to verify admin status', 
      error
    );
  }
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) throw error;
    
    return createSuccessResponse(!!data);
  } catch (error) {
    handleApiError(error, 'Failed to verify super admin status');
    return createErrorResponse(
      'Failed to verify super admin status', 
      error
    );
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<ApiResponse<any>> {
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
      
    const stats = {
      userCount: userCount || 0,
      portfolioCount: portfolioCount || 0,
      artworkCount: artworkCount || 0,
      educationCount: educationCount || 0,
      openCallCount: openCallCount || 0
    };
    
    return createSuccessResponse(stats);
  } catch (error) {
    handleApiError(error, 'Failed to fetch admin stats');
    return createErrorResponse(
      'Failed to fetch admin stats', 
      error
    );
  }
}

/**
 * Get portfolio templates
 */
export async function getPortfolioTemplates(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to fetch portfolio templates');
    return createErrorResponse(
      'Failed to fetch portfolio templates', 
      error
    );
  }
}

/**
 * Update portfolio template
 */
export async function updatePortfolioTemplate(
  templateId: string, 
  updates: any
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to update portfolio template');
    return createErrorResponse(
      'Failed to update portfolio template', 
      error
    );
  }
}

/**
 * Add new portfolio template
 */
export async function addPortfolioTemplate(template: any): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('portfolio_templates')
      .insert([template])
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to add portfolio template');
    return createErrorResponse(
      'Failed to add portfolio template', 
      error
    );
  }
}

/**
 * Delete portfolio template
 */
export async function deletePortfolioTemplate(templateId: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('portfolio_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) throw error;
    
    return createSuccessResponse(true);
  } catch (error) {
    handleApiError(error, 'Failed to delete portfolio template');
    return createErrorResponse(
      'Failed to delete portfolio template', 
      error
    );
  }
}
