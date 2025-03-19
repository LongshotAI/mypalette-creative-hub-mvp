
import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, ArrowRight, Github, Twitter, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isSupabaseConfigured } from '@/lib/supabase';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<boolean>(false);
  const { signIn, signInWithProvider, loading } = useAuth();

  useEffect(() => {
    // Check if Supabase is configured properly
    if (!isSupabaseConfigured()) {
      setConfigError(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (configError) {
      setError('Supabase is not configured. Please update the URL and anon key in src/lib/supabase.ts');
      return;
    }
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProviderSignIn = async (provider: 'github' | 'twitter') => {
    if (configError) {
      setError('Supabase is not configured. Please update the URL and anon key in src/lib/supabase.ts');
      return;
    }
    
    try {
      await signInWithProvider(provider);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DefaultLayout>
      <div className="py-16 md:py-24">
        <div className="container-custom max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to your MyPalette account
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {configError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Supabase connection is not configured. Please update the URL and anon key in <code>src/lib/supabase.ts</code>.
                </AlertDescription>
              </Alert>
            )}
            
            {error && !configError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      className="pl-10"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                  disabled={loading || configError}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full transition-all duration-300 hover:bg-secondary/80 hover:shadow-sm"
                onClick={() => handleProviderSignIn('github')}
                disabled={loading || configError}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="w-full transition-all duration-300 hover:bg-secondary/80 hover:shadow-sm"
                onClick={() => handleProviderSignIn('twitter')}
                disabled={loading || configError}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
            </div>
            
            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SignIn;
