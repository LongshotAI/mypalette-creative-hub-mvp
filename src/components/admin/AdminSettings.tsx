
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'MyPalette',
    siteDescription: 'The digital portfolio platform for artists',
    maintenanceMode: false,
    featuredArtistsLimit: '6',
    registrationOpen: true,
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Implement settings storage here when backend is configured
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Platform settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

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
