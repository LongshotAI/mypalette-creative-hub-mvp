
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion } from 'framer-motion';

interface MinimalTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const MinimalTemplate = ({ artworks, onArtworkView }: MinimalTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <motion.div 
      className="space-y-24 py-8 max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {artworks.map((artwork) => (
        <motion.div 
          key={artwork.id} 
          className="flex flex-col items-center"
          variants={itemVariants}
        >
          <motion.div 
            className="w-full max-w-3xl mx-auto cursor-pointer mb-6 hover:opacity-95 transition-all duration-300 relative"
            onClick={() => openArtworkDetail(artwork)}
            whileHover={{ scale: 1.01 }}
          >
            <motion.img 
              src={artwork.image_url} 
              alt={artwork.title}
              className="w-full h-auto rounded-sm object-contain"
              initial={{ filter: "blur(5px)", opacity: 0.8 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <motion.div 
            className="text-center max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h3 className="font-medium text-xl mb-3">{artwork.title}</h3>
            {artwork.description && (
              <p className="text-muted-foreground mb-3 max-w-prose mx-auto">{artwork.description}</p>
            )}
            {artwork.for_sale && artwork.price !== null && (
              <div className="text-primary font-medium mt-4 inline-block border border-primary/30 rounded-full px-4 py-1 bg-primary/5">
                {artwork.currency === 'USD' && '$'}
                {artwork.currency === 'EUR' && '€'}
                {artwork.currency === 'GBP' && '£'}
                {artwork.price}
                {!['USD', 'EUR', 'GBP'].includes(artwork.currency) && ` ${artwork.currency}`}
              </div>
            )}
          </motion.div>
        </motion.div>
      ))}

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </motion.div>
  );
};

export default MinimalTemplate;
