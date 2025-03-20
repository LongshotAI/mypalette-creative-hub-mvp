
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopicFilterProps {
  activeTopic: string;
  onTopicChange: (topic: string) => void;
}

const TopicFilter = ({ activeTopic, onTopicChange }: TopicFilterProps) => {
  const { user } = useAuth();
  
  const topics = [
    { id: 'all', label: 'All Topics' },
    { id: 'Digital Art', label: 'Digital Art' },
    { id: 'NFTs', label: 'NFTs' },
    { id: 'Blockchain', label: 'Blockchain' },
    { id: 'Marketing', label: 'Marketing' },
    { id: 'Legal', label: 'Legal' }
  ];

  return (
    <div className="mb-12">
      {user && (
        <div className="flex justify-center mb-6">
          <Button
            variant={activeTopic === 'favorites' ? 'default' : 'outline'} 
            onClick={() => onTopicChange(activeTopic === 'favorites' ? 'all' : 'favorites')}
          >
            <Star className={`h-4 w-4 mr-2 ${activeTopic === 'favorites' ? 'fill-white' : ''}`} />
            My Favorites
          </Button>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-2">
        {topics.map(topic => (
          <Button 
            key={topic.id}
            variant={activeTopic === topic.id ? 'secondary' : 'outline'} 
            className="rounded-full"
            onClick={() => onTopicChange(activeTopic === topic.id ? 'all' : topic.id)}
          >
            {topic.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TopicFilter;
