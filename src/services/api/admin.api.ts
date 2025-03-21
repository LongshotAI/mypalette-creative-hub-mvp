
import { supabase } from '@/lib/supabase';
import { ApiResponse } from './base.api';

export const isAdmin = async (): Promise<ApiResponse<boolean>> => {
  console.log('Checking admin status via RPC');
  
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('RPC admin check error:', error);
      return { data: false, error: error.message };
    }
    
    console.log('RPC admin check result:', data);
    console.log('Admin status result:', data);
    
    return { data: data };
  } catch (error: any) {
    console.error('Admin check error:', error);
    return { data: false, error: error.message };
  }
};

export const isSuperAdmin = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    
    if (error) {
      return { data: false, error: error.message };
    }
    
    return { data: data };
  } catch (error: any) {
    return { data: false, error: error.message };
  }
};

export const canManageAdmins = async (): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase.rpc('can_manage_admins');
    
    if (error) {
      return { data: false, error: error.message };
    }
    
    return { data: data };
  } catch (error: any) {
    return { data: false, error: error.message };
  }
};
