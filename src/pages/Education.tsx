
import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Star } from 'lucide-react';
import ResourceCard from '@/components/education/ResourceCard';
import { useAuth } from '@/contexts/AuthContext';
import { getEducationResources, getUserFavorites } from '@/lib/supabase';

// Sample data for resources
const sampleResources = [
  { 
    id: '1',
    title: "Getting Started with Digital Art: The Complete Guide", 
    type: "article" as const, 
    category: "Digital Art", 
    imageUrl: "", 
    author: "Sarah Johnson" 
  },
  { 
    id: '2',
    title: "How to Set Up Your First Cryptocurrency Wallet", 
    type: "guide" as const, 
    category: "Blockchain", 
    imageUrl: "", 
    author: "Michael Chen" 
  },
  { 
    id: '3',
    title: "Understanding NFT Marketplaces", 
    type: "video" as const, 
    category: "NFTs", 
    imageUrl: "", 
    author: "Alex Rodriguez" 
  },
  { 
    id: '4',
    title: "Smart Contracts Explained for Artists", 
    type: "article" as const, 
    category: "Blockchain", 
    imageUrl: "", 
    author: "Jamie Williams" 
  },
  { 
    id: '5',
    title: "Color Theory for Digital Artists", 
    type: "video" as const, 
    category: "Digital Art", 
    imageUrl: "", 
    author: "Priya Patel" 
  },
  { 
    id: '6',
    title: "Step-by-Step: Minting Your First NFT", 
    type: "guide" as const, 
    category: "NFTs", 
    imageUrl: "", 
    author: "Thomas Lee" 
  },
  { 
    id: '7',
    title: "Digital Art Copyright: Protecting Your Work", 
    type: "article" as const, 
    category: "Legal", 
    imageUrl: "", 
    author: "Elena Garcia" 
  },
  { 
    id: '8',
    title: "Advanced Techniques in Digital Illustration", 
    type: "video" as const, 
    category: "Digital Art", 
    imageUrl: "", 
    author: "David Kim" 
  },
];

const Education = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState(sampleResources);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeTopic, setActiveTopic] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  // Fetch resources based on search and filters
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch from Supabase here
        // For now, we'll use the sample data and filter it
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        let filteredResources = [...sampleResources];
        
        // Filter by search query
        if (searchQuery) {
          filteredResources = filteredResources.filter(resource => 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Filter by type (tab)
        if (activeTab !== 'all') {
          filteredResources = filteredResources.filter(resource => 
            resource.type === activeTab
          );
        }
        
        // Filter by topic
        if (activeTopic !== 'all') {
          filteredResources = filteredResources.filter(resource => 
            resource.category === activeTopic
          );
        }
        
        setResources(filteredResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [searchQuery, activeTab, activeTopic]);
  
  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds([]);
        return;
      }
      
      try {
        // In a real implementation, we would fetch from Supabase here
        // For now, just set sample favorites
        setFavoriteIds(['1', '3', '5']);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    
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
  const handleFavoriteToggle = (resourceId: string, isFavorite: boolean) => {
    if (isFavorite) {
      // Add to favorites
      setFavoriteIds(prev => [...prev, resourceId]);
    } else {
      // Remove from favorites
      setFavoriteIds(prev => prev.filter(id => id !== resourceId));
    }
  };

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
              ) : resources.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No resources found matching your search criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                      setActiveTopic('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resources
                    .filter(resource => {
                      if (activeTopic === 'favorites') {
                        return favoriteIds.includes(resource.id);
                      }
                      return true;
                    })
                    .map((resource) => (
                      <ResourceCard 
                        key={resource.id}
                        id={resource.id}
                        title={resource.title}
                        type={resource.type}
                        category={resource.category}
                        imageUrl={resource.imageUrl}
                        author={resource.author}
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
          
          {/* Load more button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Load More
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Education;
