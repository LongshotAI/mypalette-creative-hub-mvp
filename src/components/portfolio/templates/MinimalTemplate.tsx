
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';

interface MinimalTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const MinimalTemplate = ({ artworks = [], onArtworkView }: MinimalTemplateProps) => {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } }
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

  // For very large collections, implement virtual scrolling
  const displayArtworks = artworks.length > 100 ? artworks.slice(0, 100) : artworks;

  return (
    <motion.div 
      className="space-y-16 sm:space-y-24 py-8 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {displayArtworks.map((artwork) => (
          <motion.div 
            key={artwork.id} 
            className="flex flex-col items-center"
            variants={itemVariants}
            layout
          >
            <motion.div 
              className="w-full max-w-3xl mx-auto cursor-pointer mb-6 hover:opacity-95 transition-all duration-300 relative"
              onClick={() => openArtworkDetail(artwork)}
              whileHover={{ scale: 1.01 }}
            >
              <motion.img 
                src={artwork.image_url} 
                alt={artwork.title || 'Untitled artwork'}
                className="w-full h-auto rounded-sm object-contain"
                initial={{ filter: "blur(5px)", opacity: 0.8 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  // Fallback for broken images
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                  (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                }}
              />
            </motion.div>
            <motion.div 
              className="text-center max-w-xl mx-auto px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <h3 className="font-medium text-xl mb-3">{artwork.title || 'Untitled'}</h3>
              {artwork.description && (
                <p className="text-muted-foreground mb-3 max-w-prose mx-auto">{artwork.description}</p>
              )}
              {artwork.for_sale && artwork.price !== null && (
                <div className="text-primary font-medium mt-4 inline-block border border-primary/30 rounded-full px-4 py-1 bg-primary/5">
                  {artwork.currency === 'USD' && '$'}
                  {artwork.currency === 'EUR' && '€'}
                  {artwork.currency === 'GBP' && '£'}
                  {artwork.price}
                  {!['USD', 'EUR', 'GBP'].includes(artwork.currency || '') && ` ${artwork.currency}`}
                  {artwork.sold_out && (
                    <span className="ml-2 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs">
                      Sold Out
                    </span>
                  )}
                </div>
              )}
            </motion.div>
            <motion.div 
              className="w-full max-w-lg border-b border-border/30 mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {artworks.length > 100 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Showing first 100 artworks. Contact the artist to see more.
          </p>
        </div>
      )}

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </motion.div>
  );
};

export default MinimalTemplate;
