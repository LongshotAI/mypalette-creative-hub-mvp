
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
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
          {/* Pass adminType and lastLogin to children if needed */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, { 
                adminType, 
                lastLogin 
              });
            }
            return child;
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLayout;
