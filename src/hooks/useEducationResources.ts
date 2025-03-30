
import { useState, useEffect } from 'react';
import { getEducationResources, getUserFavorites, enhanceEducationResourcesWithImages } from '@/services/api/education.api';
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

export interface ApiResponse<T> {
  status: string;
  data: T;
  error?: {
    message: string;
  };
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
        const response = await getEducationResources(searchQuery, resourceType, category);
        
        if (response.status === 'success') {
          // Enhance with images and descriptions
          const enhancedData = enhanceEducationResourcesWithImages(response.data);
          
          // Transform data to match our interface - ensure type is correctly cast
          const transformedData = enhancedData.map(resource => ({
            ...resource,
            imageUrl: resource.image_url || '',
            type: resource.type as 'article' | 'video' | 'guide'
          }));
          
          setResources(transformedData);
          
          // If user is logged in, fetch their favorites
          if (user) {
            const favsResponse = await getUserFavorites(user.id);
            if (favsResponse.status === 'success') {
              setFavoriteIds(favsResponse.data);
            }
          }
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
