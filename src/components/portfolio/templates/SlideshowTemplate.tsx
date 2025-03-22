
import React, { useState, useEffect } from 'react';
import { Artwork } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideshowTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const SlideshowTemplate = ({ artworks, onArtworkView }: SlideshowTemplateProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  
  const currentArtwork = artworks[currentIndex];
  
  // Auto slideshow (optional feature)
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    if (autoplay) {
      const timer = setTimeout(() => {
        setDirection(1);
        goToNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoplay]);
  
  // Report artwork view when switching slides
  useEffect(() => {
    if (onArtworkView && currentArtwork) {
      onArtworkView(currentArtwork.id);
    }
  }, [currentIndex, currentArtwork, onArtworkView]);
  
  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection(1);
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the beginning
    }
  };
  
  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection(-1);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(artworks.length - 1); // Loop to the end
    }
  };
  
  const openArtworkDetail = () => {
    setModalOpen(true);
  };

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
        style={{ minHeight: '50vh' }}
        onClick={openArtworkDetail}
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
                  src={currentArtwork.image_url} 
                  alt={currentArtwork.title}
                  className="w-full h-full object-contain"
                  initial={{ filter: "blur(5px)", opacity: 0.8 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <motion.div 
                className="p-6 flex-grow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h3 className="text-2xl font-medium mb-3">{currentArtwork.title}</h3>
                
                {currentArtwork.description && (
                  <p className="text-muted-foreground mb-4 max-w-prose">{currentArtwork.description}</p>
                )}
                
                {currentArtwork.for_sale && currentArtwork.price !== null && (
                  <div className="text-primary font-medium mt-4 inline-block px-3 py-1 rounded-full bg-primary/10">
                    {currentArtwork.currency === 'USD' && '$'}
                    {currentArtwork.currency === 'EUR' && '€'}
                    {currentArtwork.currency === 'GBP' && '£'}
                    {currentArtwork.price}
                    {!['USD', 'EUR', 'GBP'].includes(currentArtwork.currency) && ` ${currentArtwork.currency}`}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background z-10 shadow-md"
          onClick={goToPrevious}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Previous</span>
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 hover:bg-background z-10 shadow-md"
          onClick={goToNext}
        >
          <ArrowRight className="h-5 w-5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
      
      <div className="flex justify-center mt-8 gap-2">
        {artworks.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-3 h-3 p-0 rounded-full transition-all duration-300 ${
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
          onClick={() => setAutoplay(!autoplay)}
        >
          {autoplay ? "Pause Slideshow" : "Auto Slideshow"}
        </Button>
      </motion.div>

      <ArtworkDetailModal 
        artwork={currentArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default SlideshowTemplate;
