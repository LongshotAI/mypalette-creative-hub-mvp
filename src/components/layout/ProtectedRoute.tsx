
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading, checkAdminStatus } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check admin status when needed
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (adminOnly && user) {
        setAdminCheckLoading(true);
        try {
          console.log('Checking admin status for user:', user.email);
          const adminStatus = await checkAdminStatus();
          console.log('Admin status result:', adminStatus);
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            console.error('Access denied: User is not an admin');
            toast.error('You do not have admin privileges');
            setError('You do not have permission to access the admin area');
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setError('Error verifying admin status');
          toast.error('Error verifying admin status');
        } finally {
          setAdminCheckLoading(false);
        }
      }
    };

    verifyAdminAccess();
  }, [user, adminOnly, checkAdminStatus]);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute status:', {
      path: location.pathname,
      adminOnly,
      isAuthenticated: !!user,
      userEmail: user?.email,
      loading,
      adminCheckLoading,
      isAdmin,
      userMetadata: user?.app_metadata,
    });
  }, [user, loading, adminCheckLoading, isAdmin, location.pathname, adminOnly]);

  if (loading || (adminOnly && adminCheckLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            {adminOnly ? 'Verifying admin access...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to sign-in');
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly) {
    // Direct check of user metadata as a fallback
    const userRole = user.app_metadata?.role;
    const hasAdminRole = userRole === 'admin' || userRole === 'super_admin';
    
    console.log('Admin check details:', { 
      isAdmin, 
      userRole,
      hasAdminRole,
      appMetadata: user.app_metadata
    });
    
    // Use both the API check result and direct metadata check
    if (isAdmin === false && !hasAdminRole) {
      console.log('Admin access denied, redirecting to dashboard');
      return (
        <div className="container mx-auto py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              {error || 'You do not have permission to access this area'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
