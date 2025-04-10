
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/education/ResourceCard';

interface EducationResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  author: string;
  external_url?: string;
  image_url?: string;
  file_url?: string; // Add this property to match usage
  imageUrl?: string; // For compatibility with existing code
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

interface ResourceListProps {
  resources: EducationResource[];
  loading: boolean;
  favoriteIds: string[];
  onFavoriteToggle: (resourceId: string, isFavorite: boolean) => Promise<void>;
  onClearFilters: () => void;
}

const ResourceList = ({ 
  resources, 
  loading, 
  favoriteIds, 
  onFavoriteToggle,
  onClearFilters 
}: ResourceListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search criteria.</p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {resources.map((resource) => (
        <ResourceCard 
          key={resource.id}
          id={resource.id}
          title={resource.title}
          type={resource.type}
          category={resource.category}
          imageUrl={resource.imageUrl || resource.image_url || ''}
          author={resource.author}
          externalUrl={resource.external_url}
          fileUrl={resource.file_url}
          isFavorite={favoriteIds.includes(resource.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default ResourceList;
