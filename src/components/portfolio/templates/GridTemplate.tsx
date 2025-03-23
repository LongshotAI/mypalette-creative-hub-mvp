
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

interface GridTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const GridTemplate = ({ artworks = [], onArtworkView }: GridTemplateProps) => {
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

  // Animation variants for staggered grid appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
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
    <div>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        layout
      >
        <AnimatePresence>
          {artworks.map((artwork) => (
            <motion.div 
              key={artwork.id} 
              className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => openArtworkDetail(artwork)}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              layout
            >
              <div className="aspect-square overflow-hidden">
                <motion.img 
                  src={artwork.image_url} 
                  alt={artwork.title || 'Untitled artwork'}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  layout
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
                  {artwork.title || 'Untitled'}
                </h3>
                {artwork.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{artwork.description}</p>
                )}
                {artwork.for_sale && artwork.price !== null && (
                  <div className="text-primary font-medium mt-2 flex items-center">
                    <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-sm">
                      {artwork.currency === 'USD' && '$'}
                      {artwork.currency === 'EUR' && '€'}
                      {artwork.currency === 'GBP' && '£'}
                      {artwork.price}
                      {!['USD', 'EUR', 'GBP'].includes(artwork.currency || '') && ` ${artwork.currency}`}
                    </span>
                    {artwork.sold_out && (
                      <span className="ml-2 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs">
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

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default GridTemplate;
