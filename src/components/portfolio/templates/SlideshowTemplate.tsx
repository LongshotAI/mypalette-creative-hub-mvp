
import React, { useState, useEffect, useCallback } from 'react';
import { Artwork } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebouncedCallback } from '@/hooks/use-debounce';

interface SlideshowTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const SlideshowTemplate = ({ artworks = [], onArtworkView }: SlideshowTemplateProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isMobile = useIsMobile();
  
  const currentArtwork = artworks[currentIndex];
  
  // Auto slideshow (optional feature)
  const [autoplay, setAutoplay] = useState(false);

  // Handle empty state gracefully
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-muted/30 border border-border/50 rounded-lg p-8 max-w-md mx-auto"
        >
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Artworks Yet</h3>
          <p className="text-muted-foreground">
            This portfolio is empty. Check back soon for new artwork additions.
          </p>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    if (autoplay && artworks.length > 1) {
      const timer = setTimeout(() => {
        setDirection(1);
        goToNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoplay, artworks.length]);
  
  // Report artwork view when switching slides
  useEffect(() => {
    if (onArtworkView && currentArtwork) {
      onArtworkView(currentArtwork.id);
    }
  }, [currentIndex, currentArtwork, onArtworkView]);
  
  const goToNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (artworks.length <= 1) return;
    
    setDirection(1);
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the beginning
    }
  }, [currentIndex, artworks.length]);
  
  const goToPrevious = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (artworks.length <= 1) return;
    
    setDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(artworks.length - 1); // Loop to the end
    }
  }, [currentIndex, artworks.length]);
  
  const openArtworkDetail = () => {
    setModalOpen(true);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const debouncedHandleTouchEnd = useDebouncedCallback(() => {
    if (touchStart - touchEnd > 100) {
      // Swipe left
      goToNext();
    }
    
    if (touchStart - touchEnd < -100) {
      // Swipe right
      goToPrevious();
    }
  }, 150);
  
  const handleTouchEnd = () => {
    debouncedHandleTouchEnd();
  };

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    })
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-4xl mx-auto bg-card shadow-lg rounded-lg overflow-hidden cursor-pointer"
        style={{ minHeight: isMobile ? '30vh' : '50vh' }}
        onClick={openArtworkDetail}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence custom={direction} initial={false}>
          <motion.div 
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div className="h-full flex flex-col">
              <div className="aspect-video overflow-hidden flex items-center justify-center bg-black/5">
                <motion.img 
                  src={currentArtwork?.image_url} 
                  alt={currentArtwork?.title || 'Artwork'}
                  className="w-full h-full object-contain"
                  initial={{ filter: "blur(5px)", opacity: 0.8 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                  }}
                />
              </div>
              
              <motion.div 
                className="p-4 md:p-6 flex-grow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h3 className="text-xl md:text-2xl font-medium mb-2 md:mb-3">{currentArtwork?.title || 'Untitled'}</h3>
                
                {currentArtwork?.description && (
                  <p className="text-muted-foreground mb-3 md:mb-4 max-w-prose line-clamp-3 md:line-clamp-none">
                    {currentArtwork.description}
                  </p>
                )}
                
                {currentArtwork?.for_sale && currentArtwork?.price !== null && (
                  <div className="text-primary font-medium mt-3 md:mt-4 inline-flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10">
                      {currentArtwork.currency === 'USD' && '$'}
                      {currentArtwork.currency === 'EUR' && '€'}
                      {currentArtwork.currency === 'GBP' && '£'}
                      {currentArtwork.price}
                      {!['USD', 'EUR', 'GBP'].includes(currentArtwork.currency || '') && ` ${currentArtwork.currency}`}
                    </span>
                    {currentArtwork.sold_out && (
                      <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-sm">
                        Sold Out
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {artworks.length > 1 && (
          <>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background z-10 shadow-md"
              onClick={goToPrevious}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background z-10 shadow-md"
              onClick={goToNext}
            >
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </>
        )}
      </div>
      
      {artworks.length > 1 && (
        <div className="flex justify-center mt-6 md:mt-8 gap-1 md:gap-2 flex-wrap">
          {artworks.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`w-2 h-2 md:w-3 md:h-3 p-0 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-primary scale-125' : 'bg-muted'
              }`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </Button>
          ))}
        </div>
      )}

      {artworks.length > 1 && (
        <motion.div 
          className="mt-4 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setAutoplay(!autoplay);
            }}
          >
            {autoplay ? "Pause Slideshow" : "Auto Slideshow"}
          </Button>
        </motion.div>
      )}

      <ArtworkDetailModal 
        artwork={currentArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default SlideshowTemplate;
