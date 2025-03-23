
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

interface StudioTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const StudioTemplate = ({ artworks = [], onArtworkView }: StudioTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
    // Call the onArtworkView function if it exists
    if (onArtworkView) {
      onArtworkView(artwork.id);
    }
  };

  // Create a studio layout with some artworks on "walls" and some on "easels"
  const getPositionClass = (index: number) => {
    if (isMobile) {
      // Simpler layout for mobile
      return index % 2 === 0 ? "col-span-2" : "col-span-2";
    }
    
    const positions = [
      "col-span-2 row-span-2", // Large feature piece
      "col-span-1 row-span-1 rotate-[-1deg]", // Wall piece
      "col-span-1 row-span-1 rotate-[1deg]", // Wall piece
      "col-span-1 row-span-2", // Vertical piece
      "col-span-2 row-span-1 rotate-[-0.5deg]", // Wide piece
      "col-span-1 row-span-1 rotate-[1.5deg]", // Small piece
    ];
    return positions[index % positions.length];
  };

  const getBgClass = (index: number) => {
    const backgrounds = [
      "bg-amber-50", // Warm off-white
      "bg-stone-100", // Warm light background
      "bg-gray-50", // Off-white
      "bg-gray-100", // Light background
    ];
    return backgrounds[index % backgrounds.length];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -2 },
    show: (i: number) => ({ 
      opacity: 1, 
      scale: 1, 
      rotate: i % 2 === 0 ? -1 : 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20, 
        delay: i * 0.05 
      }
    })
  };

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

  // For large collections, limit display
  const displayArtworks = artworks.length > 50 ? artworks.slice(0, 50) : artworks;

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-stone-200 to-stone-100 rounded-lg">
      <motion.div 
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-4 md:p-6 relative`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {displayArtworks.map((artwork, index) => (
            <motion.div 
              key={artwork.id} 
              className={`${isMobile ? 'col-span-2' : getPositionClass(index)} bg-card rounded-sm overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300`}
              onClick={() => openArtworkDetail(artwork)}
              variants={itemVariants}
              custom={index}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                rotate: 0,
                transition: { duration: 0.2 }
              }}
              layout
            >
              <div className={`relative p-2 ${getBgClass(index)} shadow-sm`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
                
                {/* Frame effect */}
                <div className="absolute inset-0 border-8 border-amber-100/80 rounded-sm pointer-events-none"></div>
                
                <motion.img 
                  src={artwork.image_url} 
                  alt={artwork.title || 'Untitled artwork'}
                  className="w-full h-full object-contain relative z-10"
                  initial={{ filter: "saturate(0.9)" }}
                  whileHover={{ filter: "saturate(1.1)" }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                  }}
                />
              </div>
              <div className="p-3 bg-white/90">
                <h3 className="font-medium text-base">{artwork.title || 'Untitled'}</h3>
                {artwork.for_sale && artwork.price !== null && (
                  <div className="text-primary font-medium mt-1 text-sm flex items-center flex-wrap gap-2">
                    <span>
                      {artwork.currency === 'USD' && '$'}
                      {artwork.currency === 'EUR' && '€'}
                      {artwork.currency === 'GBP' && '£'}
                      {artwork.price}
                      {!['USD', 'EUR', 'GBP'].includes(artwork.currency || '') && ` ${artwork.currency}`}
                    </span>
                    {artwork.sold_out && (
                      <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">
                        Sold Out
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Decorative studio elements */}
      <motion.div 
        className="absolute -z-10 right-0 bottom-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      ></motion.div>
      <motion.div 
        className="absolute -z-10 left-20 top-40 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      ></motion.div>
      <motion.div 
        className="absolute -z-10 left-1/2 bottom-0 w-32 h-32 bg-stone-100/20 rounded-full blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
      ></motion.div>

      {artworks.length > 50 && (
        <div className="text-center py-4 mt-8 text-muted-foreground text-sm">
          <p>Showing the first 50 artworks. Contact the artist to see more work.</p>
        </div>
      )}

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default StudioTemplate;
