
import React from 'react';
import { Link } from 'react-router-dom';
import { SearchResult } from '@/lib/searchService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, ExternalLink } from 'lucide-react';

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'portfolio': return 'Portfolio';
      case 'artist': return 'Artist';
      case 'opencall': return 'Open Call';
      case 'education': return 'Educational Resource';
      default: return type;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portfolio': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'artist': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'opencall': return 'bg-green-100 text-green-800 border-green-200';
      case 'education': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return '';
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to={result.url} className="block h-full">
        <div className="flex flex-col md:flex-row h-full">
          {result.image_url && (
            <div className="md:w-1/4 h-40 md:h-auto">
              <img 
                src={result.image_url} 
                alt={result.title}
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          <div className={`flex-1 p-4 ${!result.image_url ? 'md:w-full' : 'md:w-3/4'}`}>
            <div className="flex justify-between items-start mb-2">
              <Badge className={`${getTypeColor(result.type)}`}>
                {getTypeLabel(result.type)}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
            
            {result.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {result.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center text-xs text-gray-500 mt-auto">
              {(result.username || result.full_name) && (
                <div className="flex items-center mr-4 mb-1">
                  <User className="h-3 w-3 mr-1" />
                  <span>{result.full_name || result.username}</span>
                </div>
              )}
              
              <div className="flex items-center mb-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(result.created_at)}</span>
              </div>
              
              <div className="flex-grow"></div>
              
              <div className="flex items-center text-primary">
                <span className="mr-1">View</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default SearchResultCard;
