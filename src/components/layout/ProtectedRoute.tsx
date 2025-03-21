
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute: user =', user?.email, 'loading =', loading);
    if (adminOnly) {
      console.log('Checking admin status:', 
        user?.app_metadata?.role, 
        user?.user_metadata?.is_super_admin);
    }
  }, [user, loading, adminOnly]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check if admin access is required and user is not an admin
  if (adminOnly && (!user.app_metadata?.role || user.app_metadata.role !== 'admin')) {
    console.log('User attempted admin access but is not authorized:', user?.email);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
