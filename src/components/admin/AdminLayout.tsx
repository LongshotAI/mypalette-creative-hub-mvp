
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminStatus } from '@/lib/supabase';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import SubmissionManagement from './SubmissionManagement';
import ResourceManagement from './ResourceManagement';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [adminType, setAdminType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const type = await checkAdminStatus(user.id);
        setAdminType(type);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not an admin, redirect to homepage
  if (!adminType) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="resources">Education Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement currentUserIsSuper={adminType === 'super_admin'} />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        
        <TabsContent value="submissions">
          <SubmissionManagement />
        </TabsContent>
        
        <TabsContent value="resources">
          <ResourceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLayout;
