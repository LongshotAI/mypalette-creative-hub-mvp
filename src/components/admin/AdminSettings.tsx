
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  featuredArtistsLimit: string;
  registrationOpen: boolean;
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'MyPalette',
    siteDescription: 'The digital portfolio platform for artists',
    maintenanceMode: false,
    featuredArtistsLimit: '6',
    registrationOpen: true,
  });

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        setInitialLoading(true);
        
        // Try to get settings from the settings table
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error fetching settings:', error);
          toast.error('Failed to load platform settings');
          return;
        }
        
        // If we have settings data, update the state
        if (data) {
          setSettings({
            siteName: data.site_name || 'MyPalette',
            siteDescription: data.site_description || 'The digital portfolio platform for artists',
            maintenanceMode: data.maintenance_mode || false,
            featuredArtistsLimit: data.featured_artists_limit?.toString() || '6',
            registrationOpen: data.registration_open || true,
          });
          console.log('Loaded settings:', data);
        } else {
          // If no settings exist, create default settings
          await createDefaultSettings();
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
        toast.error('An error occurred while loading settings');
      } finally {
        setInitialLoading(false);
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
          }]);
          
        if (error) {
          console.error('Error creating default settings:', error);
          toast.error('Failed to create default settings');
        } else {
          console.log('Created default settings');
        }
      } catch (error) {
        console.error('Error in createDefaultSettings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // First check if settings table exists
      const { error: checkError } = await supabase
        .from('platform_settings')
        .select('*', { count: 'exact', head: true });
      
      // If the table doesn't exist, we need to create it
      if (checkError && checkError.message.includes('does not exist')) {
        await supabase.rpc('create_settings_table');
        
        // Insert initial settings
        const { error: insertError } = await supabase
          .from('platform_settings')
          .insert([{
            site_name: settings.siteName,
            site_description: settings.siteDescription,
            maintenance_mode: settings.maintenanceMode,
            featured_artists_limit: parseInt(settings.featuredArtistsLimit),
            registration_open: settings.registrationOpen,
          }]);
          
        if (insertError) {
          throw insertError;
        }
      } else {
        // Table exists, update settings
        const { error: updateError } = await supabase
          .from('platform_settings')
          .update({
            site_name: settings.siteName,
            site_description: settings.siteDescription,
            maintenance_mode: settings.maintenanceMode,
            featured_artists_limit: parseInt(settings.featuredArtistsLimit),
            registration_open: settings.registrationOpen,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
          
        if (updateError) {
          // If update fails (maybe no row with id=1), try to insert
          const { error: insertError } = await supabase
            .from('platform_settings')
            .insert([{
              site_name: settings.siteName,
              site_description: settings.siteDescription,
              maintenance_mode: settings.maintenanceMode,
              featured_artists_limit: parseInt(settings.featuredArtistsLimit),
              registration_open: settings.registrationOpen,
            }]);
            
          if (insertError) {
            throw insertError;
          }
        }
      }
      
      toast.success('Platform settings updated successfully');
      
      // Refetch settings to confirm they were saved
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .single();
        
      console.log('Settings after save:', data);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings. Please check the console for details.');
    } finally {
      setLoading(false);
    }
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
