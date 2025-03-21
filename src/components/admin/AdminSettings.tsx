
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  featuredArtistsLimit: string;
  registrationOpen: boolean;
  featuredPortfolios: string[];
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [publicPortfolios, setPublicPortfolios] = useState<any[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'MyPalette',
    siteDescription: 'The digital portfolio platform for artists',
    maintenanceMode: false,
    featuredArtistsLimit: '6',
    registrationOpen: true,
    featuredPortfolios: []
  });

  useEffect(() => {
    // Fetch current settings and portfolios
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Get all public portfolios
        try {
          // First try to get portfolios with profile relationship
          const { data: portfoliosData, error: portfoliosError } = await supabase
            .from('portfolios')
            .select('*');
            
          if (portfoliosError) {
            console.error('Error fetching portfolios:', portfoliosError);
            toast.error('Failed to load portfolios');
            setPublicPortfolios([]);
          } else {
            console.log('Portfolios with profiles:', portfoliosData);
            
            // Now fetch user profiles separately and join the data
            const portfoliosWithOwners = await Promise.all(
              portfoliosData.map(async (portfolio) => {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('full_name, email')
                  .eq('id', portfolio.user_id)
                  .single();
                  
                return {
                  ...portfolio,
                  owner_name: profileData?.full_name || 'Unknown artist',
                  owner_email: profileData?.email || 'Unknown'
                };
              })
            );
            
            setPublicPortfolios(portfoliosWithOwners);
          }
        } catch (portfolioError) {
          console.error('Error fetching public portfolios:', portfolioError);
          setPublicPortfolios([]);
        }
        
        // Get settings using the RPC function
        try {
          const { data: settingsData, error: settingsError } = await supabase
            .rpc('get_platform_settings');
            
          if (settingsError) {
            console.error('Error getting platform settings via RPC:', settingsError);
            toast.error('Failed to load platform settings');
          } else if (settingsData) {
            // If we have settings data, update the state
            setSettings({
              siteName: settingsData.site_name || 'MyPalette',
              siteDescription: settingsData.site_description || 'The digital portfolio platform for artists',
              maintenanceMode: settingsData.maintenance_mode || false,
              featuredArtistsLimit: settingsData.featured_artists_limit?.toString() || '6',
              registrationOpen: settingsData.registration_open || true,
              featuredPortfolios: settingsData.featured_portfolios || []
            });
            console.log('Loaded settings via RPC:', settingsData);
          }
        } catch (settingsError) {
          console.error('Error checking platform settings via RPC:', settingsError);
          
          // Fallback to direct table query
          try {
            const { data, error } = await supabase
              .from('platform_settings')
              .select('*')
              .single();
              
            if (error) {
              console.error('Error fetching settings directly:', error);
            } else if (data) {
              setSettings({
                siteName: data.site_name || 'MyPalette',
                siteDescription: data.site_description || 'The digital portfolio platform for artists',
                maintenanceMode: data.maintenance_mode || false,
                featuredArtistsLimit: data.featured_artists_limit?.toString() || '6',
                registrationOpen: data.registration_open || true,
                featuredPortfolios: data.featured_portfolios || []
              });
              console.log('Loaded settings via direct query:', data);
            }
          } catch (directError) {
            console.error('Error in direct settings fetch:', directError);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast.error('An error occurred while loading settings');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      const settingsData = {
        p_site_name: settings.siteName,
        p_site_description: settings.siteDescription,
        p_maintenance_mode: settings.maintenanceMode,
        p_featured_artists_limit: parseInt(settings.featuredArtistsLimit),
        p_registration_open: settings.registrationOpen,
        p_featured_portfolios: settings.featuredPortfolios
      };
      
      // Try to save settings via RPC
      const { data, error } = await supabase
        .rpc('update_platform_settings', settingsData);
        
      if (error) {
        console.error('Error saving settings via RPC:', error);
        
        // Fallback to direct update
        try {
          const { error: directError } = await supabase
            .from('platform_settings')
            .update({
              site_name: settings.siteName,
              site_description: settings.siteDescription,
              maintenance_mode: settings.maintenanceMode,
              featured_artists_limit: parseInt(settings.featuredArtistsLimit),
              registration_open: settings.registrationOpen,
              featured_portfolios: settings.featuredPortfolios,
              updated_at: new Date().toISOString()
            })
            .eq('id', 1);
            
          if (directError) {
            throw directError;
          }
        } catch (directError) {
          console.error('Error in direct settings update:', directError);
          throw directError;
        }
      }
      
      toast.success('Platform settings updated successfully');
      console.log('Settings saved successfully:', data);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const addFeaturedPortfolio = (portfolioId: string) => {
    if (!settings.featuredPortfolios.includes(portfolioId)) {
      setSettings({
        ...settings,
        featuredPortfolios: [...settings.featuredPortfolios, portfolioId]
      });
    }
  };

  const removeFeaturedPortfolio = (portfolioId: string) => {
    setSettings({
      ...settings,
      featuredPortfolios: settings.featuredPortfolios.filter(id => id !== portfolioId)
    });
  };

  // Get portfolio details by ID
  const getPortfolioById = (id: string) => {
    return publicPortfolios.find(portfolio => portfolio.id === id);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Platform settings will be applied globally and affect all users. Please use caution when changing these settings.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>
            Configure global settings for the entire platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to put the site in maintenance mode. Only admins will be able to access the site.
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registrationOpen">User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register on the platform.
                  </p>
                </div>
                <Switch
                  id="registrationOpen"
                  checked={settings.registrationOpen}
                  onCheckedChange={(checked) => setSettings({...settings, registrationOpen: checked})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="featuredArtistsLimit">Featured Artists Limit</Label>
              <Input
                id="featuredArtistsLimit"
                type="number"
                min="1"
                max="20"
                value={settings.featuredArtistsLimit}
                onChange={(e) => setSettings({...settings, featuredArtistsLimit: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of featured artists to display on the homepage.
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Featured Portfolios</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select portfolios to feature on the homepage.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {settings.featuredPortfolios.map(portfolioId => {
                    const portfolio = getPortfolioById(portfolioId);
                    return portfolio ? (
                      <div key={portfolioId} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{portfolio.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {portfolio.owner_name || 'Unknown artist'}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFeaturedPortfolio(portfolioId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="newFeaturedPortfolio" className="mb-2 block">
                      Add Featured Portfolio
                    </Label>
                    <Select onValueChange={addFeaturedPortfolio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicPortfolios
                          .filter(p => !settings.featuredPortfolios.includes(p.id))
                          .map(portfolio => (
                            <SelectItem key={portfolio.id} value={portfolio.id}>
                              {portfolio.name} ({portfolio.owner_name || 'Unknown'})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
