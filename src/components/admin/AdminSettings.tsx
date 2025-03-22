
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getPlatformSettings, updatePlatformSettings } from "@/services/api/admin.api";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const settingsSchema = z.object({
  site_name: z.string().min(3, { message: "Site name must be at least 3 characters" }),
  site_description: z.string().optional(),
  maintenance_mode: z.boolean().default(false),
  registration_open: z.boolean().default(true),
  featured_artists_limit: z.coerce.number().int().min(0).max(50).default(6),
  featured_portfolios: z.array(z.string()).default([]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      site_name: 'MyPalette',
      site_description: '',
      maintenance_mode: false,
      registration_open: true,
      featured_artists_limit: 6,
      featured_portfolios: [],
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getPlatformSettings();
      
      if (response.error) {
        console.error('Error loading settings:', response.error);
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        console.log('Loaded settings:', response.data);
        form.reset({
          site_name: response.data.site_name || 'MyPalette',
          site_description: response.data.site_description || '',
          maintenance_mode: response.data.maintenance_mode || false,
          registration_open: response.data.registration_open || true,
          featured_artists_limit: response.data.featured_artists_limit || 6,
          featured_portfolios: response.data.featured_portfolios || [],
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setSubmitting(true);
      console.log('Submitting settings:', values);
      
      const response = await updatePlatformSettings(values);
      
      if (response.error) {
        console.error('Error updating settings:', response.error);
        throw new Error(response.error.message);
      }
      
      console.log('Settings updated successfully');
      toast.success('Platform settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update platform settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>
          Configure global settings for your MyPalette platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your platform displayed in the header and title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="site_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ''}
                      rows={3}
                      placeholder="A brief description of your platform"
                    />
                  </FormControl>
                  <FormDescription>
                    Used for SEO and may appear in search results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="maintenance_mode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Maintenance Mode</FormLabel>
                      <FormDescription>
                        Only admins can access the site when enabled
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registration_open"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Registration</FormLabel>
                      <FormDescription>
                        Enable new user sign-ups
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="featured_artists_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Artists Limit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={50} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of featured artists shown on the homepage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={submitting || !form.formState.isDirty}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
