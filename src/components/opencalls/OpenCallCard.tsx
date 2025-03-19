
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';

interface OpenCallCardProps { 
  id: string;
  title: string; 
  organization: string; 
  deadline: string; 
  category: string; 
  imageUrl: string;
  status: 'open' | 'closed' | 'upcoming';
  onApplyClick?: (id: string) => void;
}

const OpenCallCard = ({ 
  id,
  title, 
  organization, 
  deadline, 
  category, 
  imageUrl,
  status,
  onApplyClick
}: OpenCallCardProps) => {
  const statusStyles = {
    open: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    upcoming: "bg-blue-100 text-blue-800"
  };
  
  // Calculate if deadline is near (within 7 days)
  const isDeadlineNear = () => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };
  
  const handleApplyClick = () => {
    if (onApplyClick) {
      onApplyClick(id);
    }
  };

  return (
    <Card className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
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
        <div className={`absolute top-3 left-3 ${statusStyles[status]} px-3 py-1 rounded-full text-xs font-medium uppercase`}>
          {status}
        </div>
      </div>
      
      <div className="p-5">
        <div className="text-xs font-medium text-muted-foreground mb-1">{category}</div>
        <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">By {organization}</p>
        
        <div className="flex items-center text-sm mb-4">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className={cn(
            "text-muted-foreground",
            isDeadlineNear() && status === 'open' && "text-amber-600 font-medium"
          )}>
            Deadline: {deadline}
            {isDeadlineNear() && status === 'open' && " (Soon)"}
          </span>
        </div>
        
        <Button 
          className="w-full rounded-md transition-all duration-300" 
          variant={status === 'open' ? 'default' : 'outline'}
          disabled={status !== 'open'}
          onClick={handleApplyClick}
        >
          {status === 'open' ? 'Apply Now' : status === 'upcoming' ? 'Coming Soon' : 'Closed'}
        </Button>
      </div>
    </Card>
  );
};

export default OpenCallCard;
