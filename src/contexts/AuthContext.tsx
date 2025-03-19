
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not configured. Please update the URL and anon key in src/lib/supabase.ts');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!isSupabaseConfigured()) {
        toast.error("Supabase is not configured. Please update the URL and anon key.");
        return;
      }

      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
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
      if (!isSupabaseConfigured()) {
        toast.error("Supabase is not configured. Please update the URL and anon key.");
        return;
      }

      setLoading(true);
      
      // Create the user
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        } 
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        toast.info("This email is already registered. Please check your inbox for the confirmation link or try signing in.");
      } else {
        toast.success("Account created successfully! Check your email for confirmation if required.");
        // Redirect user only if email confirmation is not required
        if (data?.session) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // More user-friendly error messages
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
      if (!isSupabaseConfigured()) {
        toast.error("Supabase is not configured. Please update the URL and anon key.");
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
      if (!isSupabaseConfigured()) {
        toast.error("Supabase is not configured. Please update the URL and anon key.");
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
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
      signInWithProvider
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
