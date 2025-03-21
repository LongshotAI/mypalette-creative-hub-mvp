
import React, { useState, useEffect } from 'react';
import { Artwork } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ArtworkDetailModal from '../ArtworkDetailModal';

interface SlideshowTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const SlideshowTemplate = ({ artworks, onArtworkView }: SlideshowTemplateProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  
  const currentArtwork = artworks[currentIndex];
  
  // Report artwork view when switching slides
  useEffect(() => {
    if (onArtworkView && currentArtwork) {
      onArtworkView(currentArtwork.id);
    }
  }, [currentIndex, currentArtwork, onArtworkView]);
  
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the beginning
    }
  };
  
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(artworks.length - 1); // Loop to the end
    }
  };
  
  const openArtworkDetail = () => {
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-4xl mx-auto bg-card shadow-md rounded-lg overflow-hidden cursor-pointer"
        onClick={openArtworkDetail}
      >
        <div className="aspect-[16/9] overflow-hidden">
          <img 
            src={currentArtwork.image_url} 
            alt={currentArtwork.title}
            className="w-full h-full object-contain"
          />
        </div>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
          onClick={goToPrevious}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background"
          onClick={goToNext}
        >
          <ArrowRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
        
        <div className="p-6">
          <h3 className="text-xl font-medium mb-2">{currentArtwork.title}</h3>
          
          {currentArtwork.description && (
            <p className="text-muted-foreground mb-4">{currentArtwork.description}</p>
          )}
          
          {currentArtwork.for_sale && currentArtwork.price !== null && (
            <div className="text-primary font-medium">
              {currentArtwork.currency === 'USD' && '$'}
              {currentArtwork.currency === 'EUR' && '€'}
              {currentArtwork.currency === 'GBP' && '£'}
              {currentArtwork.price}
              {!['USD', 'EUR', 'GBP'].includes(currentArtwork.currency) && ` ${currentArtwork.currency}`}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        {artworks.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-8 h-2 p-0 rounded-full ${
              currentIndex === index ? 'bg-primary' : 'bg-muted'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </Button>
        ))}
      </div>

      <ArtworkDetailModal 
        artwork={currentArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default SlideshowTemplate;
