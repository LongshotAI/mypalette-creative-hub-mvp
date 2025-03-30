
import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import EducationHeader from '@/components/education/EducationHeader';
import SearchBar from '@/components/education/SearchBar';
import ResourceList from '@/components/education/ResourceList';
import ResourceTypeFilter from '@/components/education/ResourceTypeFilter';
import TopicFilter from '@/components/education/TopicFilter';
import { getEducationResources, toggleFavoriteResource, getUserFavorites, getFavoriteResources, enhanceEducationResourcesWithImages } from '@/services/api/education.api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Education = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceType, setResourceType] = useState('all');
  const [category, setCategory] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    fetchResources();
  }, [searchQuery, resourceType, category, user?.id]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // Special case for favorites filter
      if (category === 'favorites' && user) {
        const response = await getFavoriteResources(user.id);
        if (response.status === 'success') {
          // Enhance resources with images and descriptions
          const enhancedResources = enhanceEducationResourcesWithImages(response.data || []);
          setResources(enhancedResources);
        } else {
          throw new Error(response.error?.message || 'Failed to load favorite resources');
        }
      } else {
        // Regular resources fetch with filters
        const response = await getEducationResources(searchQuery, resourceType, category === 'favorites' ? 'all' : category);
        if (response.status === 'success') {
          // Enhance resources with images and descriptions
          const enhancedResources = enhanceEducationResourcesWithImages(response.data || []);
          setResources(enhancedResources);
        } else {
          throw new Error(response.error?.message || 'Failed to load resources');
        }
      }
      
      // Fetch user favorites if logged in
      if (user) {
        const favResponse = await getUserFavorites(user.id);
        if (favResponse.status === 'success') {
          setFavoriteIds(favResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeChange = (type: string) => {
    setResourceType(type);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleFavoriteToggle = async (resourceId: string, isFavorite: boolean) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    try {
      const response = await toggleFavoriteResource(resourceId, user.id, isFavorite);
      
      if (response.status === 'success') {
        // Update local state
        if (isFavorite) {
          setFavoriteIds(prev => prev.filter(id => id !== resourceId));
          toast.success('Removed from favorites');
        } else {
          setFavoriteIds(prev => [...prev, resourceId]);
          toast.success('Added to favorites');
        }
      } else {
        throw new Error(response.error?.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setResourceType('all');
    setCategory('all');
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <EducationHeader />
        
        <SearchBar onSearch={handleSearchChange} initialQuery={searchQuery} />
        
        <ResourceTypeFilter activeTab={resourceType} onTabChange={handleTypeChange} />
        
        <TopicFilter activeTopic={category} onTopicChange={handleCategoryChange} />
        
        <ResourceList 
          resources={resources}
          loading={loading}
          favoriteIds={favoriteIds}
          onFavoriteToggle={handleFavoriteToggle}
          onClearFilters={handleClearFilters}
        />
      </div>
    </DefaultLayout>
  );
};

export default Education;
