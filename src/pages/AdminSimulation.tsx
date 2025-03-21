
import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import AdminSimulationTabs from '@/components/admin/simulation/AdminSimulationTabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminSimulation = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is a super admin
  const isSuperAdmin = user?.app_metadata?.role === 'admin' || 
                      user?.user_metadata?.is_super_admin;

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not a super admin
  if (!isSuperAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <AdminLayout>
      <AdminSimulationTabs />
    </AdminLayout>
  );
};

export default AdminSimulation;
