
import { AdminType } from '@/types/admin';
import { supabase } from './client';

// Admin-related functions
export const checkAdminStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('admin_type')
    .eq('id', userId)
    .single();
    
  if (error || !data) {
    console.error('Error checking admin status:', error);
    return null;
  }
  
  return data.admin_type;
};

export const getAllAdmins = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, admin_type, full_name, created_at')
    .not('admin_type', 'is', null)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
  
  // Get emails from auth.users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 100,
  });
  
  if (usersError || !usersData) {
    console.error('Error fetching user emails:', usersError);
    return data;
  }
  
  // Map emails to admin records
  const adminWithEmails = data.map(admin => {
    const user = usersData.users.find(u => u.id === admin.id);
    return {
      ...admin,
      email: user?.email || 'Unknown'
    };
  });
  
  return adminWithEmails;
};

export const updateAdminRole = async (userId: string, adminType: AdminType) => {
  const { error } = await supabase
    .from('profiles')
    .update({ admin_type: adminType })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating admin role:', error);
    return false;
  }
  
  return true;
};
