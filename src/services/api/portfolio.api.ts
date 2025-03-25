
import { Portfolio, PortfolioFormData } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './base.api';

/**
 * Get all portfolios for a specific user
 */
export const getUserPortfolios = async (userId: string): Promise<ApiResponse<Portfolio[]>> => {
  try {
    console.log('Fetching portfolios for user ID:', userId);
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
    
    return createSuccessResponse(data || []);
  } catch (error) {
    console.error('Failed to fetch user portfolios:', error);
    return createErrorResponse('Failed to fetch user portfolios', error);
  }
};

/**
 * Create a new portfolio
 */
export const createPortfolio = async (userId: string, portfolioData: PortfolioFormData): Promise<ApiResponse<Portfolio>> => {
  try {
    console.log('Creating portfolio for user:', userId, portfolioData);
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
    
    if (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
    
    return createSuccessResponse(data);
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return createErrorResponse('Failed to create portfolio', error);
  }
};

/**
 * Update an existing portfolio
 */
export const updatePortfolio = async (portfolioId: string, portfolioData: PortfolioFormData): Promise<ApiResponse<Portfolio>> => {
  try {
    console.log('Updating portfolio:', portfolioId, portfolioData);
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        name: portfolioData.name,
        description: portfolioData.description,
        template: portfolioData.template,
        theme: portfolioData.theme,
        is_public: portfolioData.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
    
    return createSuccessResponse(data);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return createErrorResponse('Failed to update portfolio', error);
  }
};

/**
 * Delete a portfolio
 */
export const deletePortfolio = async (portfolioId: string): Promise<ApiResponse<null>> => {
  try {
    console.log('Deleting portfolio:', portfolioId);
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);
    
    if (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
    
    return createSuccessResponse(null);
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return createErrorResponse('Failed to delete portfolio', error);
  }
};

/**
 * Get a specific portfolio by ID
 */
export const getPortfolio = async (portfolioId: string): Promise<ApiResponse<Portfolio>> => {
  try {
    console.log('Fetching portfolio by ID:', portfolioId);
    
    if (!portfolioId) {
      return createErrorResponse('Portfolio ID is required', new Error('Portfolio ID is required'));
    }
    
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
    
    return createSuccessResponse(data);
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return createErrorResponse('Failed to fetch portfolio', error);
  }
};

/**
 * Get public portfolios with creator information
 */
export const getPublicPortfolios = async (limit = 10): Promise<ApiResponse<Portfolio[]>> => {
  try {
    console.log('Fetching public portfolios, limit:', limit);
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
      throw error;
    }
    
    return createSuccessResponse(data || []);
  } catch (error) {
    console.error('Failed to fetch public portfolios:', error);
    return createErrorResponse('Failed to fetch public portfolios', error);
  }
};

/**
 * Get portfolio with user information
 */
export const getPortfolioWithUser = async (portfolioId: string): Promise<ApiResponse<any>> => {
  try {
    console.log('Fetching portfolio with user info, ID:', portfolioId);
    
    if (!portfolioId) {
      console.error('Portfolio ID is required');
      return createErrorResponse('Portfolio ID is required', new Error('Portfolio ID is required'));
    }
    
    // First check if the portfolio exists and get its data
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (portfolioError) {
      console.error('Portfolio fetch error:', portfolioError);
      
      // Check if it's a not found error
      if (portfolioError.code === 'PGRST116') {
        return createErrorResponse('Portfolio not found', new Error('Portfolio not found'));
      }
      
      throw portfolioError;
    }
    
    if (!portfolio) {
      console.error('No portfolio found for ID:', portfolioId);
      return createErrorResponse('Portfolio not found', new Error('Portfolio not found'));
    }
    
    // Then try to fetch the profile information
    let profileData = null;
    
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          banner_image_url,
          instagram_url,
          twitter_url,
          website_url,
          contact_email,
          location,
          artist_statement,
          current_exhibition
        `)
        .eq('id', portfolio.user_id);
      
      if (!profileError && profiles && profiles.length > 0) {
        profileData = profiles[0];
      } else if (profileError) {
        console.warn('Profile fetch error:', profileError);
      } else {
        console.warn('No profile found for user_id:', portfolio.user_id);
      }
    } catch (profileFetchError) {
      console.error('Profile fetch error:', profileFetchError);
      // Continue even if profile fetch fails - we'll return the portfolio without profile data
    }
    
    // Combine the data
    const portfolioWithUser = {
      ...portfolio,
      profiles: profileData
    };
    
    console.log('Returning portfolio with user data:', portfolioWithUser);
    return createSuccessResponse(portfolioWithUser);
  } catch (error) {
    console.error('Failed to fetch portfolio with user:', error);
    return createErrorResponse('Failed to fetch portfolio with user', error);
  }
};
