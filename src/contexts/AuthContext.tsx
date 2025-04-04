
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'github' | 'twitter') => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
  checkSuperAdminStatus: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with:', email);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', data);
      toast.success("Successfully signed in");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Signing up with:', email, name);
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        } 
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up response:', data);
      
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        toast.info("This email is already registered. Please check your inbox for the confirmation link or try signing in.");
      } else {
        toast.success("Account created successfully! Check your email for confirmation if required.");
        if (data?.session) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message.includes('unique constraint')) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      navigate('/');
      toast.success("Successfully signed out");
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'github' | 'twitter') => {
    try {
      setLoading(true);
      console.log(`Signing in with ${provider}`);
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        console.error('OAuth sign in error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // First, check if we have admin role in the user metadata (client-side check)
      const userRole = user.app_metadata?.role;
      if (userRole === 'admin' || userRole === 'super_admin') {
        return true;
      }
      
      // If no role in metadata, check with the Supabase RPC function
      console.log('Checking admin status via RPC');
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status via RPC:', error);
        return false;
      }
      
      console.log('RPC admin check result:', data);
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const checkSuperAdminStatus = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // First, check if we have super_admin role in the user metadata (client-side check)
      const userRole = user.app_metadata?.role;
      if (userRole === 'super_admin') {
        return true;
      }
      
      // If no role in metadata, check with the Supabase RPC function
      console.log('Checking super admin status via RPC');
      const { data, error } = await supabase.rpc('is_super_admin');
      
      if (error) {
        console.error('Error checking super admin status via RPC:', error);
        return false;
      }
      
      console.log('RPC super admin check result:', data);
      return !!data;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      signInWithProvider,
      checkAdminStatus,
      checkSuperAdminStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
