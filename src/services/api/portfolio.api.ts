
import { Portfolio, PortfolioFormData } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './base.api';

/**
 * Get all portfolios for a specific user
 */
export const getUserPortfolios = async (userId: string): Promise<ApiResponse<Portfolio[]>> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse('Failed to fetch user portfolios', error);
  }
};

/**
 * Create a new portfolio
 */
export const createPortfolio = async (userId: string, portfolioData: PortfolioFormData): Promise<ApiResponse<Portfolio>> => {
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
    return createErrorResponse('Failed to create portfolio', error);
  }
};

/**
 * Update an existing portfolio
 */
export const updatePortfolio = async (portfolioId: string, portfolioData: PortfolioFormData): Promise<ApiResponse<Portfolio>> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        name: portfolioData.name,
        description: portfolioData.description,
        template: portfolioData.template,
        theme: portfolioData.theme,
        is_public: portfolioData.is_public
      })
      .eq('id', portfolioId)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse('Failed to update portfolio', error);
  }
};

/**
 * Delete a portfolio
 */
export const deletePortfolio = async (portfolioId: string): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);
    
    if (error) throw error;
    
    return createSuccessResponse(null);
  } catch (error) {
    return createErrorResponse('Failed to delete portfolio', error);
  }
};

/**
 * Get a specific portfolio by ID
 */
export const getPortfolio = async (portfolioId: string): Promise<ApiResponse<Portfolio>> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse('Failed to fetch portfolio', error);
  }
};

/**
 * Get public portfolios with creator information
 */
export const getPublicPortfolios = async (limit = 10): Promise<ApiResponse<Portfolio[]>> => {
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
    return createErrorResponse('Failed to fetch public portfolios', error);
  }
};

/**
 * Get portfolio with user information
 */
export const getPortfolioWithUser = async (portfolioId: string): Promise<ApiResponse<any>> => {
  try {
    // First get the portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (portfolioError) throw portfolioError;
    
    if (!portfolio) {
      return createErrorResponse('Portfolio not found', new Error('Portfolio not found'));
    }
    
    // Then fetch the profile information
    const { data: profile, error: profileError } = await supabase
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
      .eq('id', portfolio.user_id)
      .single();
    
    if (profileError) throw profileError;
    
    // Combine the data
    const portfolioWithUser = {
      ...portfolio,
      profiles: profile
    };
    
    return createSuccessResponse(portfolioWithUser);
  } catch (error) {
    return createErrorResponse('Failed to fetch portfolio with user', error);
  }
};
