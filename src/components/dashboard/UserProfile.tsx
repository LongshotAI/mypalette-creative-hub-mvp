
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Twitter, Globe, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, getUserProfile } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserProfileData {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  website_url: string;
  instagram_url: string;
  twitter_url: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: '',
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
    website_url: '',
    instagram_url: '',
    twitter_url: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const profile = await getUserProfile(user.id);
        
        if (profile) {
          setProfileData({
            id: profile.id,
            username: profile.username || '',
            full_name: profile.full_name || user.user_metadata?.full_name || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
            website_url: profile.website_url || '',
            instagram_url: profile.instagram_url || '',
            twitter_url: profile.twitter_url || ''
          });
        } else {
          // Initialize with user metadata if available
          setProfileData({
            id: user.id,
            username: '',
            full_name: user.user_metadata?.full_name || '',
            bio: '',
            avatar_url: '',
            website_url: '',
            instagram_url: '',
            twitter_url: ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profileData.username,
          full_name: profileData.full_name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          website_url: profileData.website_url,
          instagram_url: profileData.instagram_url,
          twitter_url: profileData.twitter_url,
          updated_at: new Date()
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar image must be less than 5MB');
      return;
    }
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      toast.error('Avatar must be an image file (JPG, PNG, or GIF)');
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update profile data state
      setProfileData({
        ...profileData,
        avatar_url: publicUrl
      });
      
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your public profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/80 transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="sr-only">Upload avatar</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  placeholder="Choose a unique username"
                />
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Tell others about yourself and your art"
              rows={4}
            />
          </div>
          
          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <Label htmlFor="website_url" className="sr-only">Website</Label>
                <Input
                  id="website_url"
                  value={profileData.website_url}
                  onChange={(e) => setProfileData({...profileData, website_url: e.target.value})}
                  placeholder="Your website URL"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Instagram className="h-5 w-5 text-gray-400 mr-2" />
                <Label htmlFor="instagram_url" className="sr-only">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={profileData.instagram_url}
                  onChange={(e) => setProfileData({...profileData, instagram_url: e.target.value})}
                  placeholder="Instagram username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Twitter className="h-5 w-5 text-gray-400 mr-2" />
                <Label htmlFor="twitter_url" className="sr-only">Twitter</Label>
                <Input
                  id="twitter_url"
                  value={profileData.twitter_url}
                  onChange={(e) => setProfileData({...profileData, twitter_url: e.target.value})}
                  placeholder="Twitter username"
                />
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
