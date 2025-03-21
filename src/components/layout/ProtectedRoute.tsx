
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
    console.log('ProtectedRoute: user =', user);
    console.log('Role check:', user?.app_metadata?.role);
    console.log('Admin only?', adminOnly);
    console.log('Loading state:', loading);
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

  // Enhanced admin check with more detailed logging
  if (adminOnly) {
    console.log('Checking admin access with metadata:', user.app_metadata);
    const isAdmin = user.app_metadata?.role === 'admin';
    console.log('Is admin?', isAdmin);
    
    if (!isAdmin) {
      console.log('Access denied: Redirecting non-admin user to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
