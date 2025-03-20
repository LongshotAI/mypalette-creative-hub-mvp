
import { useState, useEffect } from 'react';
import { getEducationResources, getUserFavorites } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface EducationResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  image_url?: string;
  author: string;
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  external_url?: string;
}

export const useEducationResources = (
  searchQuery: string = '',
  resourceType: string = 'all',
  category: string = 'all'
) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        // Fetch resources
        const data = await getEducationResources(searchQuery, resourceType, category);
        
        // Transform data to match our interface
        const transformedData = data.map(resource => ({
          ...resource,
          imageUrl: resource.image_url || ''
        }));
        
        setResources(transformedData);
        
        // If user is logged in, fetch their favorites
        if (user) {
          const favs = await getUserFavorites(user.id);
          setFavoriteIds(favs);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [searchQuery, resourceType, category, user]);

  return { resources, loading, favoriteIds, setFavoriteIds };
};
