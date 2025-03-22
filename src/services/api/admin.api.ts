import { supabase } from '@/lib/supabase';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './base.api';

export const isAdmin = async (): Promise<ApiResponse<boolean>> => {
  console.log('Checking admin status via RPC');
  
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('RPC admin check error:', error);
      return createErrorResponse<boolean>(error.message, error);
    }
    
    console.log('Admin status result:', data);
    
    return createSuccessResponse<boolean>(data);
  } catch (error: any) {
    console.error('Admin check error:', error);
    return createErrorResponse<boolean>(error.message || 'Failed to check admin status');
  }
};

export const isSuperAdmin = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      return createErrorResponse<boolean>(error.message, error);
    }
    
    return createSuccessResponse<boolean>(data);
  } catch (error: any) {
    return createErrorResponse<boolean>(error.message || 'Failed to check super admin status');
  }
};

export const canManageAdmins = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('can_manage_admins');
    
    if (error) {
      return createErrorResponse<boolean>(error.message, error);
    }
    
    return createSuccessResponse<boolean>(data);
  } catch (error: any) {
    return createErrorResponse<boolean>(error.message || 'Failed to check admin management permissions');
  }
};

export const getPlatformSettings = async (): Promise<ApiResponse<Record<string, any>>> => {
  try {
    // Try to get settings via RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_platform_settings');
    
    if (!rpcError && rpcData) {
      return createSuccessResponse<Record<string, any>>(rpcData);
    }
    
    // Fallback to direct query if RPC fails
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) {
      return createErrorResponse<Record<string, any>>(
        error.message || 'Failed to retrieve platform settings',
        error
      );
    }
    
    return createSuccessResponse<Record<string, any>>(data || {});
  } catch (error: any) {
    return createErrorResponse<Record<string, any>>(
      error.message || 'Failed to retrieve platform settings'
    );
  }
};

export const updatePlatformSettings = async (settings: Record<string, any>): Promise<ApiResponse<boolean>> => {
  try {
    // Try to update via RPC first
    const settingsData = {
      p_site_name: settings.site_name || settings.siteName,
      p_site_description: settings.site_description || settings.siteDescription,
      p_maintenance_mode: settings.maintenance_mode || settings.maintenanceMode,
      p_featured_artists_limit: parseInt(settings.featured_artists_limit || settings.featuredArtistsLimit),
      p_registration_open: settings.registration_open || settings.registrationOpen,
      p_featured_portfolios: settings.featured_portfolios || settings.featuredPortfolios || []
    };
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('update_platform_settings', settingsData);
      
    if (!rpcError) {
      return createSuccessResponse<boolean>(true);
    }
    
    console.error('RPC update error, falling back to direct update:', rpcError);
    
    // Check if settings record exists
    const { data: existingData, error: checkError } = await supabase
      .from('platform_settings')
      .select('id')
      .single();
    
    let updateError;
    
    if (existingData) {
      // Update existing record
      const { error } = await supabase
        .from('platform_settings')
        .update({
          site_name: settings.site_name || settings.siteName,
          site_description: settings.site_description || settings.siteDescription,
          maintenance_mode: settings.maintenance_mode || settings.maintenanceMode,
          featured_artists_limit: parseInt(settings.featured_artists_limit || settings.featuredArtistsLimit),
          registration_open: settings.registration_open || settings.registrationOpen,
          featured_portfolios: settings.featured_portfolios || settings.featuredPortfolios || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
      
      updateError = error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('platform_settings')
        .insert([{
          site_name: settings.site_name || settings.siteName,
          site_description: settings.site_description || settings.siteDescription,
          maintenance_mode: settings.maintenance_mode || settings.maintenanceMode,
          featured_artists_limit: parseInt(settings.featured_artists_limit || settings.featuredArtistsLimit),
          registration_open: settings.registration_open || settings.registrationOpen,
          featured_portfolios: settings.featured_portfolios || settings.featuredPortfolios || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      updateError = error;
    }
    
    if (updateError || checkError) {
      return createErrorResponse<boolean>(
        (updateError || checkError)?.message || 'Failed to update platform settings',
        updateError || checkError
      );
    }
    
    return createSuccessResponse<boolean>(true);
  } catch (error: any) {
    return createErrorResponse<boolean>(
      error.message || 'Failed to update platform settings'
    );
  }
};

export const getAdminStats = async (): Promise<ApiResponse<{
  userCount: number;
  portfolioCount: number;
  artworkCount: number;
  educationCount: number;
  openCallCount: number;
}>> {
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
      
    return createSuccessResponse({
      userCount: userCount || 0,
      portfolioCount: portfolioCount || 0,
      artworkCount: artworkCount || 0,
      educationCount: educationCount || 0,
      openCallCount: openCallCount || 0
    });
  } catch (error: any) {
    return createErrorResponse<{
      userCount: number;
      portfolioCount: number;
      artworkCount: number;
      educationCount: number;
      openCallCount: number;
    }>(error.message || 'Failed to fetch admin statistics', error);
  }
};
