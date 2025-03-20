
import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Star } from 'lucide-react';
import ResourceCard from '@/components/education/ResourceCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEducationResources } from '@/hooks/useEducationResources';
import { toggleFavoriteResource } from '@/lib/supabase';
import { toast } from 'sonner';

const Education = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeTopic, setActiveTopic] = useState('all');
  
  // Use our custom hook to get resources
  const { resources, loading, favoriteIds, setFavoriteIds } = useEducationResources(
    searchQuery,
    activeTab,
    activeTopic === 'favorites' ? 'all' : activeTopic
  );
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchInput(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debouncing
    const timeout = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
    
    setSearchTimeout(timeout);
  };
  
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

  return (
    <DefaultLayout>
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Education Hub</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Expand your knowledge with articles, videos, and guides on digital art, NFTs, and more
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-lg mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search educational resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* User favorites button - only show if logged in */}
            {user && (
              <Button
                variant={activeTopic === 'favorites' ? 'default' : 'outline'} 
                className="mb-6"
                onClick={() => setActiveTopic(activeTopic === 'favorites' ? 'all' : 'favorites')}
              >
                <Star className={`h-4 w-4 mr-2 ${activeTopic === 'favorites' ? 'fill-white' : ''}`} />
                My Favorites
              </Button>
            )}
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
                <TabsTrigger value="guide">Guides</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : displayedResources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No resources found matching your search criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchInput('');
                      setActiveTab('all');
                      setActiveTopic('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedResources.map((resource) => (
                    <ResourceCard 
                      key={resource.id}
                      id={resource.id}
                      title={resource.title}
                      type={resource.type}
                      category={resource.category}
                      imageUrl={resource.imageUrl || resource.image_url || ''}
                      author={resource.author}
                      externalUrl={resource.external_url}
                      isFavorite={favoriteIds.includes(resource.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>
          
          {/* Topic filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button 
              variant={activeTopic === 'all' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic('all')}
            >
              All Topics
            </Button>
            <Button 
              variant={activeTopic === 'Digital Art' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic(activeTopic === 'Digital Art' ? 'all' : 'Digital Art')}
            >
              Digital Art
            </Button>
            <Button 
              variant={activeTopic === 'NFTs' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic(activeTopic === 'NFTs' ? 'all' : 'NFTs')}
            >
              NFTs
            </Button>
            <Button 
              variant={activeTopic === 'Blockchain' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic(activeTopic === 'Blockchain' ? 'all' : 'Blockchain')}
            >
              Blockchain
            </Button>
            <Button 
              variant={activeTopic === 'Marketing' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic(activeTopic === 'Marketing' ? 'all' : 'Marketing')}
            >
              Marketing
            </Button>
            <Button 
              variant={activeTopic === 'Legal' ? 'secondary' : 'outline'} 
              className="rounded-full"
              onClick={() => setActiveTopic(activeTopic === 'Legal' ? 'all' : 'Legal')}
            >
              Legal
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Education;
