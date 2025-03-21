
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import AdminTabs from '@/components/admin/navigation/AdminTabs';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/services/api/admin.api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const Admin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminType, setAdminType] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    // Log that we've successfully reached the admin page
    console.log('Admin page accessed by:', user?.email);
    console.log('User metadata:', user?.app_metadata);
    
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        if (!user) {
          toast.error('You must be logged in to access the admin dashboard');
          return;
        }
        
        const adminResponse = await isAdmin();
        if (!adminResponse.success || !adminResponse.data) {
          console.error('User does not have admin privileges:', user.email);
          toast.error('You do not have permission to access the admin dashboard');
          return;
        }
        
        // Get admin type from user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('admin_type, updated_at')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setAdminType(profileData.admin_type);
          setLastLogin(profileData.updated_at);
        }
        
        // Update last login time
        await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
          
        console.log('Admin access verified for:', user.email);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        toast.error('Error verifying admin permissions');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  // Don't show anything until we've verified admin status
  // AdminLayout already handles the loading state for the initial auth check
  
  return (
    <AdminLayout>
      <AdminTabs adminType={adminType} lastLogin={lastLogin} />
    </AdminLayout>
  );
};

export default Admin;
