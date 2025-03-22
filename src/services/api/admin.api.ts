
import { supabase } from '@/lib/supabase';
import { ApiResponse, ApiError } from './base.api';

export const isAdmin = async (): Promise<ApiResponse<boolean>> => {
  console.log('Checking admin status via RPC');
  
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('RPC admin check error:', error);
      return { 
        data: false, 
        error: error as ApiError,
        status: 'error'
      };
    }
    
    console.log('RPC admin check result:', data);
    console.log('Admin status result:', data);
    
    return { 
      data: data, 
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    console.error('Admin check error:', error);
    return { 
      data: false, 
      error: { message: error.message } as ApiError,
      status: 'error'
    };
  }
};

export const isSuperAdmin = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      return { 
        data: false, 
        error: error as ApiError,
        status: 'error'
      };
    }
    
    return { 
      data: data, 
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    return { 
      data: false, 
      error: { message: error.message } as ApiError,
      status: 'error'
    };
  }
};

export const canManageAdmins = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('can_manage_admins');
    
    if (error) {
      return { 
        data: false, 
        error: error as ApiError,
        status: 'error'
      };
    }
    
    return { 
      data: data, 
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    return { 
      data: false, 
      error: { message: error.message } as ApiError,
      status: 'error'
    };
  }
};

export const getPlatformSettings = async (): Promise<ApiResponse<Record<string, any>>> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) {
      return { 
        data: {}, 
        error: error as ApiError,
        status: 'error'
      };
    }
    
    return { 
      data: data || {}, 
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    return { 
      data: {}, 
      error: { message: error.message } as ApiError,
      status: 'error'
    };
  }
};

export const updatePlatformSettings = async (settings: Record<string, any>): Promise<ApiResponse<boolean>> => {
  try {
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
        .update(settings)
        .eq('id', existingData.id);
      
      updateError = error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('platform_settings')
        .insert([settings]);
      
      updateError = error;
    }
    
    if (updateError || checkError) {
      return { 
        data: false, 
        error: (updateError || checkError) as ApiError,
        status: 'error'
      };
    }
    
    return { 
      data: true, 
      error: null,
      status: 'success'
    };
  } catch (error: any) {
    return { 
      data: false, 
      error: { message: error.message } as ApiError,
      status: 'error'
    };
  }
};

