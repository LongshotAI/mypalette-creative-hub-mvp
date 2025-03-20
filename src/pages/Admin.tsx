
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as AdminUsersModule from '@/components/admin/AdminUsers';
import AdminPortfolios from '@/components/admin/AdminPortfolios';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminEducation from '@/components/admin/AdminEducation';
import AdminStats from '@/components/admin/AdminStats';
import AdminOpenCalls from '@/components/admin/AdminOpenCalls';
import AdminTemplates from '@/components/admin/AdminTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Admin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminType, setAdminType] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Record admin login attempt in analytics/logs
    const logAdminAccess = async () => {
      if (user) {
        console.log(`Admin access attempt by ${user.email} at ${new Date().toISOString()}`);
        // Here you would typically log this to a secure audit table in your database
      }
    };
    
    logAdminAccess();
  }, [user]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/sign-in');
        return;
      }

      try {
        // Check if user is an admin
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        
        if (isAdminError) {
          console.error('Error checking admin status:', isAdminError);
          toast.error('Error verifying admin status');
          navigate('/dashboard');
          return;
        }
        
        if (!isAdminData) {
          // Log unauthorized access attempt
          console.error(`Unauthorized admin access attempt by ${user.email}`);
          
          // Increment failed login attempts counter
          setLoginAttempts(prev => prev + 1);
          
          toast.error('You do not have permission to access this area');
          navigate('/dashboard');
          return;
        }
        
        setIsAdmin(isAdminData);
        
        // Get admin type (regular admin vs super_admin)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('admin_type, updated_at')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching admin profile:', profileError);
        } else {
          setAdminType(profileData.admin_type);
          setLastLogin(profileData.updated_at);
          
          // Update last login timestamp
          await supabase
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This shouldn't render as we redirect non-admins
  }

  // Get the AdminUsers component from the module
  // Since the module doesn't have a default export, we need to extract the component differently
  const AdminUsers = Object.values(AdminUsersModule)[0] as React.ComponentType;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {adminType === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>
      
      {adminType === 'super_admin' && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Super Admin Mode</AlertTitle>
          <AlertDescription className="text-yellow-700">
            You have elevated privileges. All actions are logged and audited.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Admin Dashboard Overview</CardTitle>
          <CardDescription>
            Manage all aspects of MyPalette from this central dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminStats adminType={adminType} lastLogin={lastLogin} />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="opencalls">Open Calls</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-lg mb-4">Welcome to the Admin Dashboard</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Review new user signups</li>
                  <li>Approve pending portfolios</li>
                  <li>Moderate reported content</li>
                  <li>Update platform announcements</li>
                  <li>Manage featured artists on homepage</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Security Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>All admin actions are logged and audited for security purposes. Multi-factor authentication is recommended for all admin accounts.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Admin Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Use the tabs above to navigate between different management sections. Each section provides tools to manage specific aspects of the platform.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users">
          {AdminUsers ? <AdminUsers /> : <div>Users component not available</div>}
        </TabsContent>
        <TabsContent value="portfolios">
          <AdminPortfolios />
        </TabsContent>
        <TabsContent value="templates">
          <AdminTemplates />
        </TabsContent>
        <TabsContent value="education">
          <AdminEducation />
        </TabsContent>
        <TabsContent value="opencalls">
          <AdminOpenCalls />
        </TabsContent>
        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
