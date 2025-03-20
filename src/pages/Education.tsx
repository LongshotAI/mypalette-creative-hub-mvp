
import React, { useState } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEducationResources } from '@/hooks/useEducationResources';
import { toggleFavoriteResource } from '@/lib/supabase';
import { toast } from 'sonner';

// Importing our new components
import EducationHeader from '@/components/education/EducationHeader';
import SearchBar from '@/components/education/SearchBar';
import ResourceTypeFilter from '@/components/education/ResourceTypeFilter';
import TopicFilter from '@/components/education/TopicFilter';
import ResourceList from '@/components/education/ResourceList';

const Education = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeTopic, setActiveTopic] = useState('all');
  
  // Use our custom hook to get resources
  const { resources, loading, favoriteIds, setFavoriteIds } = useEducationResources(
    searchQuery,
    activeTab,
    activeTopic === 'favorites' ? 'all' : activeTopic
  );
  
  // Handle favorite toggle
  const handleFavoriteToggle = async (resourceId: string, isFavorite: boolean) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    // Optimistically update UI
    if (isFavorite) {
      setFavoriteIds(prev => prev.filter(id => id !== resourceId));
    } else {
      setFavoriteIds(prev => [...prev, resourceId]);
    }
    
    // Call API to update favorite status
    const success = await toggleFavoriteResource(resourceId, user.id, isFavorite);
    
    if (!success) {
      // If API call fails, revert UI change
      toast.error('Failed to update favorites');
      if (isFavorite) {
        setFavoriteIds(prev => [...prev, resourceId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== resourceId));
      }
    }
  };

  // Filter resources for favorites view
  const displayedResources = activeTopic === 'favorites'
    ? resources.filter(resource => favoriteIds.includes(resource.id))
    : resources;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setActiveTopic('all');
  };

  return (
    <DefaultLayout>
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <EducationHeader />
          <SearchBar onSearch={setSearchQuery} initialQuery={searchQuery} />
          
          <ResourceTypeFilter activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="mt-8">
            <ResourceList 
              resources={displayedResources} 
              loading={loading} 
              favoriteIds={favoriteIds} 
              onFavoriteToggle={handleFavoriteToggle}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          <TopicFilter activeTopic={activeTopic} onTopicChange={setActiveTopic} />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Education;
