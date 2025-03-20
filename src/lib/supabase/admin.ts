
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
  // Define explicit type for the admin profile data
  type AdminProfile = {
    id: string;
    admin_type: AdminType;
    full_name: string | null;
    created_at: string;
  };
  
  // First, get all profiles with admin privileges
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .not('admin_type', 'is', null)
    .order('created_at', { ascending: false });
    
  if (error || !data) {
    console.error('Error fetching admins:', error);
    return [];
  }
  
  // Get emails from auth.users
  const usersResponse = await supabase.auth.admin.listUsers({
    perPage: 100,
  });
  
  if (usersResponse.error) {
    console.error('Error fetching user emails:', usersResponse.error);
    return data as AdminProfile[]; // Add type assertion here too
  }

  // Type assertion for the admin data
  const adminData = data as AdminProfile[];
  
  // Map emails to admin records
  const adminWithEmails = adminData.map(admin => {
    const user = usersResponse.data.users.find(u => u.id === admin.id);
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
