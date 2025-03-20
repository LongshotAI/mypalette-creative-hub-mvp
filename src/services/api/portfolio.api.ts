
import { Portfolio, PortfolioFormData } from '@/types/portfolio';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase,
  ApiResponse 
} from './base.api';

/**
 * Get all portfolios for a user
 */
export async function getUserPortfolios(userId: string): Promise<ApiResponse<Portfolio[]>> {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to load your portfolios');
    return createErrorResponse(
      'Failed to load portfolios', 
      error
    );
  }
}

/**
 * Get a portfolio by ID
 */
export async function getPortfolioById(portfolioId: string): Promise<ApiResponse<Portfolio>> {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to load portfolio');
    return createErrorResponse(
      'Failed to load portfolio', 
      error
    );
  }
}

/**
 * Get a portfolio with user information
 */
export async function getPortfolioWithUser(portfolioId: string): Promise<ApiResponse<any>> {
  try {
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
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to load portfolio with user information');
    return createErrorResponse(
      'Failed to load portfolio with user information', 
      error
    );
  }
}

/**
 * Create a new portfolio
 */
export async function createPortfolio(
  userId: string, 
  portfolioData: PortfolioFormData
): Promise<ApiResponse<Portfolio>> {
  try {
    const newPortfolio = {
      user_id: userId,
      name: portfolioData.name,
      description: portfolioData.description,
      template: portfolioData.template,
      theme: portfolioData.theme,
      is_public: portfolioData.is_public
    };
    
    const { data, error } = await supabase
      .from('portfolios')
      .insert([newPortfolio])
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to create portfolio');
    return createErrorResponse(
      'Failed to create portfolio', 
      error
    );
  }
}

/**
 * Update an existing portfolio
 */
export async function updatePortfolio(
  portfolioId: string, 
  portfolioData: PortfolioFormData
): Promise<ApiResponse<Portfolio>> {
  try {
    const updates = {
      name: portfolioData.name,
      description: portfolioData.description,
      template: portfolioData.template,
      theme: portfolioData.theme,
      is_public: portfolioData.is_public
    };
    
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', portfolioId)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to update portfolio');
    return createErrorResponse(
      'Failed to update portfolio', 
      error
    );
  }
}

/**
 * Delete a portfolio
 */
export async function deletePortfolio(portfolioId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);
    
    if (error) throw error;
    
    return createSuccessResponse(null);
  } catch (error) {
    handleApiError(error, 'Failed to delete portfolio');
    return createErrorResponse(
      'Failed to delete portfolio', 
      error
    );
  }
}

/**
 * Get public portfolios with creator information
 */
export async function getPublicPortfolios(limit = 10): Promise<ApiResponse<any[]>> {
  try {
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
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to load public portfolios');
    return createErrorResponse(
      'Failed to load public portfolios', 
      error
    );
  }
}

/**
 * Get featured portfolios for homepage
 */
export async function getFeaturedPortfolios(limit = 6): Promise<ApiResponse<any[]>> {
  try {
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
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to load featured portfolios');
    return createErrorResponse(
      'Failed to load featured portfolios', 
      error
    );
  }
}
