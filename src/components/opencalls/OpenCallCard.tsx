
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [imageOpen, setImageOpen] = useState(false);
  
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

  // Use sample images if no imageUrl is provided
  const displayImageUrl = imageUrl || `https://images.unsplash.com/photo-${1500000000000 + parseInt(id) * 10000}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;

  return (
    <Card className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer"
          style={{
            backgroundImage: `url(${displayImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => setImageOpen(true)}
        >
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="sm" variant="secondary" className="bg-white/80">
              <Image className="h-4 w-4 mr-2" />
              View Image
            </Button>
          </div>
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

      {/* Image Dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {organization} - {category}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-hidden rounded-md">
            <img 
              src={displayImageUrl} 
              alt={title} 
              className="w-full h-auto object-contain max-h-[70vh]" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OpenCallCard;
