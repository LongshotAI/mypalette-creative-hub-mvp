
import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log authentication status for debugging
    if (loading) {
      console.log('Dashboard: Authentication status loading...');
    } else if (user) {
      console.log('Dashboard: User authenticated:', user.email);
    } else {
      console.log('Dashboard: User not authenticated, will redirect to login');
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Show toast notification for better UX
    toast.error('Please sign in to access this page');
    
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
