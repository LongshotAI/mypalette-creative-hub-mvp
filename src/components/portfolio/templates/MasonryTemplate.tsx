
import React, { useState, useEffect } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

interface MasonryTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const MasonryTemplate = ({ artworks = [], onArtworkView }: MasonryTemplateProps) => {
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

  // Handle large collections efficiently
  const safeArtworks = artworks.length > 200 ? artworks.slice(0, 200) : artworks;

  // Split artworks into columns for masonry effect
  const getColumns = () => {
    if (isMobile) {
      // On mobile, use 1 or 2 columns depending on orientation
      const columns = [[], []];
      safeArtworks.forEach((artwork, index) => {
        const columnIndex = index % 2;
        columns[columnIndex].push(artwork);
      });
      return columns.filter(col => col.length > 0);
    }
    
    // Desktop: 3 columns
    const columns = [[], [], []];
    safeArtworks.forEach((artwork, index) => {
      const columnIndex = index % 3;
      columns[columnIndex].push(artwork);
    });
    return columns;
  };

  const columns = getColumns();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
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

  return (
    <div className="py-4">
      <motion.div 
        className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {columns.map((column, columnIndex) => (
          <motion.div 
            key={columnIndex} 
            className="flex flex-col gap-4 md:gap-6"
            variants={columnVariants}
          >
            <AnimatePresence>
              {column.map((artwork: Artwork) => (
                <motion.div 
                  key={artwork.id} 
                  className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative"
                  onClick={() => openArtworkDetail(artwork)}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  layout
                >
                  <div className={`overflow-hidden ${
                    columnIndex === 1 ? 'aspect-[3/4]' : 
                    columnIndex === 2 ? 'aspect-[4/5]' : 
                    'aspect-square'
                  }`}>
                    <motion.img 
                      src={artwork.image_url} 
                      alt={artwork.title || 'Untitled artwork'}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      onError={(e) => {
                        // Fallback for broken images
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                        (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </div>
                  <div className="p-4 relative">
                    <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{artwork.title || 'Untitled'}</h3>
                    {artwork.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2 opacity-80">{artwork.description}</p>
                    )}
                    {artwork.for_sale && artwork.price !== null && (
                      <div className="text-primary font-medium mt-2 flex items-center">
                        <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                          {artwork.currency === 'USD' && '$'}
                          {artwork.currency === 'EUR' && '€'}
                          {artwork.currency === 'GBP' && '£'}
                          {artwork.price}
                          {!['USD', 'EUR', 'GBP'].includes(artwork.currency || '') && ` ${artwork.currency}`}
                        </span>
                        {artwork.sold_out && (
                          <span className="ml-2 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">
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
        ))}
      </motion.div>

      {artworks.length > 200 && (
        <div className="text-center py-8 mt-4 text-muted-foreground text-sm">
          <p>Showing the first 200 artworks. Contact the artist to see more work.</p>
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

export default MasonryTemplate;
