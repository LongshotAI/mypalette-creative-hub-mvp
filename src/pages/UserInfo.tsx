
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getUserProfile, getUserPortfolios } from '@/lib/supabase';
import { Loader2, MapPin, Globe, Instagram, Twitter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GridTemplate } from '@/components/portfolio/templates/GridTemplate';

const UserInfo = () => {
  const { id: userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (userId) {
          const userProfile = await getUserProfile(userId);
          setProfile(userProfile);
          
          const userPortfolios = await getUserPortfolios(userId);
          setPortfolios(userPortfolios.filter((p: any) => p.is_public));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="container-custom py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DefaultLayout>
    );
  }

  if (!profile) {
    return (
      <DefaultLayout>
        <div className="container-custom py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">User Not Found</h2>
                <p className="text-muted-foreground mt-2">
                  The user profile you are looking for does not exist or is not available.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container-custom py-12">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1">{profile.full_name}</h1>
                
                {profile.username && (
                  <p className="text-muted-foreground mb-3">@{profile.username}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </Badge>
                  )}
                  
                  {profile.current_exhibition && (
                    <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
                      Currently Exhibiting
                    </Badge>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="mb-4 max-w-2xl">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.website_url && (
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    </Button>
                  )}
                  
                  {profile.instagram_url && (
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {profile.twitter_url && (
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="portfolios">
          <TabsList className="mb-4">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolios">
            {portfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <CardTitle>{portfolio.name}</CardTitle>
                      {portfolio.description && (
                        <CardDescription>{portfolio.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      <Button variant="ghost" className="w-full h-10 rounded-none border-t" asChild>
                        <a href={`/portfolio/${portfolio.id}`}>View Portfolio</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <p className="text-muted-foreground">No public portfolios available</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6">
                {profile.artist_statement ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Artist Statement</h3>
                    <p className="mb-6 whitespace-pre-line">{profile.artist_statement}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No artist statement available
                  </p>
                )}
                
                {profile.current_exhibition && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Current Exhibition</h3>
                      <p className="whitespace-pre-line">{profile.current_exhibition}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default UserInfo;
