
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, Video, FileText } from 'lucide-react';

// Placeholder component for education resource cards
const ResourceCard = ({ 
  title, 
  type, 
  category, 
  imageUrl, 
  author 
}: { 
  title: string; 
  type: string; 
  category: string; 
  imageUrl: string;
  author: string;
}) => {
  const iconMap = {
    'article': <Book className="h-5 w-5" />,
    'video': <Video className="h-5 w-5" />,
    'guide': <FileText className="h-5 w-5" />,
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!imageUrl && (
            <span className="text-gray-400">Image placeholder</span>
          )}
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center">
          {type in iconMap ? iconMap[type as keyof typeof iconMap] : null}
          <span className="ml-1">{type}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs font-medium text-muted-foreground mb-1">{category}</div>
        <h3 className="font-medium text-base line-clamp-2 mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">By {author}</p>
      </div>
    </div>
  );
};

const Education = () => {
  // Sample data
  const resources = [
    { 
      title: "Getting Started with Digital Art: The Complete Guide", 
      type: "article", 
      category: "Digital Art", 
      imageUrl: "", 
      author: "Sarah Johnson" 
    },
    { 
      title: "How to Set Up Your First Cryptocurrency Wallet", 
      type: "guide", 
      category: "Blockchain", 
      imageUrl: "", 
      author: "Michael Chen" 
    },
    { 
      title: "Understanding NFT Marketplaces", 
      type: "video", 
      category: "NFTs", 
      imageUrl: "", 
      author: "Alex Rodriguez" 
    },
    { 
      title: "Smart Contracts Explained for Artists", 
      type: "article", 
      category: "Blockchain", 
      imageUrl: "", 
      author: "Jamie Williams" 
    },
    { 
      title: "Color Theory for Digital Artists", 
      type: "video", 
      category: "Digital Art", 
      imageUrl: "", 
      author: "Priya Patel" 
    },
    { 
      title: "Step-by-Step: Minting Your First NFT", 
      type: "guide", 
      category: "NFTs", 
      imageUrl: "", 
      author: "Thomas Lee" 
    },
    { 
      title: "Digital Art Copyright: Protecting Your Work", 
      type: "article", 
      category: "Legal", 
      imageUrl: "", 
      author: "Elena Garcia" 
    },
    { 
      title: "Advanced Techniques in Digital Illustration", 
      type: "video", 
      category: "Digital Art", 
      imageUrl: "", 
      author: "David Kim" 
    },
  ];

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
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search educational resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="all" className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resources.map((resource, index) => (
                  <ResourceCard 
                    key={index}
                    title={resource.title}
                    type={resource.type}
                    category={resource.category}
                    imageUrl={resource.imageUrl}
                    author={resource.author}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="articles" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resources
                  .filter(resource => resource.type === 'article')
                  .map((resource, index) => (
                    <ResourceCard 
                      key={index}
                      title={resource.title}
                      type={resource.type}
                      category={resource.category}
                      imageUrl={resource.imageUrl}
                      author={resource.author}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resources
                  .filter(resource => resource.type === 'video')
                  .map((resource, index) => (
                    <ResourceCard 
                      key={index}
                      title={resource.title}
                      type={resource.type}
                      category={resource.category}
                      imageUrl={resource.imageUrl}
                      author={resource.author}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="guides" className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resources
                  .filter(resource => resource.type === 'guide')
                  .map((resource, index) => (
                    <ResourceCard 
                      key={index}
                      title={resource.title}
                      type={resource.type}
                      category={resource.category}
                      imageUrl={resource.imageUrl}
                      author={resource.author}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Topic filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button variant="secondary" className="rounded-full">All Topics</Button>
            <Button variant="outline" className="rounded-full">Digital Art</Button>
            <Button variant="outline" className="rounded-full">NFTs</Button>
            <Button variant="outline" className="rounded-full">Blockchain</Button>
            <Button variant="outline" className="rounded-full">Marketing</Button>
            <Button variant="outline" className="rounded-full">Legal</Button>
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
