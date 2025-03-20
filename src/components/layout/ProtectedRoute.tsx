
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminStatus } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Check if this is an admin route
  useEffect(() => {
    setIsAdminRoute(location.pathname.startsWith('/admin'));
  }, [location]);

  // Check admin status when needed
  useEffect(() => {
    const verifyAdmin = async () => {
      if (user && isAdminRoute) {
        const adminType = await checkAdminStatus(user.id);
        setIsAdmin(!!adminType);
      } else {
        setIsAdmin(false);
      }
      setAdminCheckComplete(true);
    };

    if (!loading && isAdminRoute) {
      verifyAdmin();
    } else if (!isAdminRoute) {
      setAdminCheckComplete(true);
    }
  }, [user, loading, isAdminRoute]);

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute:', {
      user: user?.email,
      loading,
      isAdminRoute,
      isAdmin,
      adminCheckComplete
    });
  }, [user, loading, isAdminRoute, isAdmin, adminCheckComplete]);

  if (loading || (isAdminRoute && !adminCheckComplete)) {
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

  // Block access to admin routes for non-admins
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
