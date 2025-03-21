
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
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolios')
            .select(`
              *,
              profiles:user_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(100);
            
          if (portfolioError) {
            console.error('Error fetching portfolios with profiles:', portfolioError);
            
            // Fallback to just fetch portfolios without the relationship
            const { data: fallbackData } = await supabase
              .from('portfolios')
              .select('*')
              .eq('is_public', true)
              .order('created_at', { ascending: false })
              .limit(100);
              
            setPublicPortfolios(fallbackData || []);
          } else {
            setPublicPortfolios(portfolioData || []);
          }
        } catch (portfolioError) {
          console.error('Error fetching public portfolios:', portfolioError);
          setPublicPortfolios([]);
        }
        
        // Try to get settings from the settings table
        try {
          const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .single();
            
          if (error) {
            // Table might not exist, we'll create it
            if (error.code === '42P01') { // relation does not exist
              console.log('Platform settings table does not exist, will create it');
              await createSettingsTable();
            } else {
              console.error('Error fetching settings:', error);
              toast.error('Failed to load platform settings');
            }
          } else if (data) {
            // If we have settings data, update the state
            setSettings({
              siteName: data.site_name || 'MyPalette',
              siteDescription: data.site_description || 'The digital portfolio platform for artists',
              maintenanceMode: data.maintenance_mode || false,
              featuredArtistsLimit: data.featured_artists_limit?.toString() || '6',
              registrationOpen: data.registration_open || true,
              featuredPortfolios: data.featured_portfolios || []
            });
            console.log('Loaded settings:', data);
          }
        } catch (settingsError) {
          console.error('Error checking platform settings:', settingsError);
          // Will fall back to default settings
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast.error('An error occurred while loading settings');
      } finally {
        setInitialLoading(false);
      }
    };

    const createSettingsTable = async () => {
      try {
        // Create the platform_settings table if it doesn't exist
        const { error: createTableError } = await supabase.rpc('create_settings_table').maybeSingle();
        
        if (createTableError) {
          // RPC might not exist, so we'll try direct SQL (though this is less ideal)
          console.error('Error creating settings table via RPC:', createTableError);
          toast.error('Could not create settings table. Contact your administrator.');
          return;
        }
        
        // Create default settings
        await createDefaultSettings();
      } catch (error) {
        console.error('Error creating settings table:', error);
        toast.error('Failed to initialize platform settings');
      }
    };

    const createDefaultSettings = async () => {
      try {
        // Create default settings
        const { error } = await supabase
          .from('platform_settings')
          .insert([{
            site_name: settings.siteName,
            site_description: settings.siteDescription,
            maintenance_mode: settings.maintenanceMode,
            featured_artists_limit: parseInt(settings.featuredArtistsLimit),
            registration_open: settings.registrationOpen,
            featured_portfolios: []
          }]);
          
        if (error) {
          console.error('Error creating default settings:', error);
          toast.error('Failed to create default settings');
        } else {
          console.log('Created default settings');
          toast.success('Default platform settings created');
        }
      } catch (error) {
        console.error('Error in createDefaultSettings:', error);
        toast.error('Failed to initialize default settings');
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Check if settings table exists
      const { error: checkError } = await supabase
        .from('platform_settings')
        .select('*', { count: 'exact', head: true });
      
      // If the table doesn't exist, we need to create it
      if (checkError && checkError.message.includes('does not exist')) {
        // Create the table via SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.platform_settings (
            id SERIAL PRIMARY KEY,
            site_name TEXT NOT NULL DEFAULT 'MyPalette',
            site_description TEXT DEFAULT 'The digital portfolio platform for artists',
            maintenance_mode BOOLEAN DEFAULT FALSE,
            featured_artists_limit INTEGER DEFAULT 6,
            registration_open BOOLEAN DEFAULT TRUE,
            featured_portfolios UUID[] DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        
        try {
          // This requires superuser privileges, which is why we typically use RPC
          // In a real app, this would be done during initial setup/migration
          await supabase.rpc('create_settings_table');
        } catch (createError) {
          console.error('Failed to create settings table:', createError);
          toast.error('Unable to create settings table. Contact your administrator.');
          return;
        }
      }
      
      // Check if we need to insert or update
      const { data: existingData, error: fetchError } = await supabase
        .from('platform_settings')
        .select('id')
        .limit(1);
        
      if (fetchError && !fetchError.message.includes('does not exist')) {
        console.error('Error checking existing settings:', fetchError);
        toast.error('Failed to check existing settings');
        return;
      }
      
      const settingsData = {
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        maintenance_mode: settings.maintenanceMode,
        featured_artists_limit: parseInt(settings.featuredArtistsLimit),
        registration_open: settings.registrationOpen,
        featured_portfolios: settings.featuredPortfolios,
        updated_at: new Date().toISOString()
      };
      
      if (!existingData || existingData.length === 0) {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('platform_settings')
          .insert([settingsData]);
          
        if (insertError) {
          console.error('Error inserting settings:', insertError);
          toast.error('Failed to save settings');
          return;
        }
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('platform_settings')
          .update(settingsData)
          .eq('id', existingData[0].id);
          
        if (updateError) {
          console.error('Error updating settings:', updateError);
          toast.error('Failed to update settings');
          return;
        }
      }
      
      toast.success('Platform settings updated successfully');
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
                            {portfolio.profiles?.full_name || 'Unknown artist'}
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
                              {portfolio.name} ({portfolio.profiles?.full_name || 'Unknown'})
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
