
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Mail, Twitter, Loader2, MapPin, ArrowLeft } from 'lucide-react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { getUserPortfolios } from '@/lib/supabase';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        navigate('/not-found');
        return;
      }

      try {
        setLoading(true);
        const profileData = await getUserProfile(userId);
        
        if (!profileData) {
          navigate('/not-found');
          return;
        }
        
        setProfile(profileData);
        
        // Fetch user's portfolios
        const userPortfolios = await getUserPortfolios(userId);
        setPortfolios(userPortfolios || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DefaultLayout>
    );
  }

  if (!profile) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4">User not found</h2>
          <p className="text-muted-foreground mb-6">The user profile you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 
                     profile.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.full_name || profile.username || 'Artist'}</CardTitle>
                  <CardDescription className="text-base mt-1">{profile.bio || 'No bio provided'}</CardDescription>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link to="/portfolios">
                  View Other Artists
                </Link>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2">
                {profile.artist_statement && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Artist Statement</h3>
                    <p className="text-muted-foreground">{profile.artist_statement}</p>
                  </div>
                )}
                
                {profile.current_exhibition && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Currently Exhibiting</h3>
                    <p className="text-muted-foreground">{profile.current_exhibition}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact & Social</h3>
                <div className="space-y-3">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-muted-foreground mr-2" />
                      <a href={`mailto:${profile.contact_email}`} className="hover:underline">
                        {profile.contact_email}
                      </a>
                    </div>
                  )}
                  
                  {profile.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-muted-foreground mr-2" />
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Personal Website
                      </a>
                    </div>
                  )}
                  
                  {profile.instagram_url && (
                    <div className="flex items-center">
                      <Instagram className="h-5 w-5 text-muted-foreground mr-2" />
                      <a href={`https://instagram.com/${profile.instagram_url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        @{profile.instagram_url}
                      </a>
                    </div>
                  )}
                  
                  {profile.twitter_url && (
                    <div className="flex items-center">
                      <Twitter className="h-5 w-5 text-muted-foreground mr-2" />
                      <a href={`https://twitter.com/${profile.twitter_url}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        @{profile.twitter_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="portfolios" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolios">
            {portfolios.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No Portfolios Yet</h3>
                <p className="text-muted-foreground mb-4">
                  This artist hasn't created any public portfolios yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                      {/* Portfolio preview image */}
                      <div className="w-full h-full bg-gray-200"></div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      {portfolio.description && (
                        <CardDescription>
                          {portfolio.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/portfolio/${portfolio.id}`}>
                          View Portfolio
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default UserProfile;
