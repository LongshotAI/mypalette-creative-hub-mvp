
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion } from 'framer-motion';

interface GridTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const GridTemplate = ({ artworks, onArtworkView }: GridTemplateProps) => {
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

  return (
    <div>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {artworks.map((artwork) => (
          <motion.div 
            key={artwork.id} 
            className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => openArtworkDetail(artwork)}
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="aspect-square overflow-hidden">
              <motion.img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                layout
              />
            </div>
            <div className="p-5">
              <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{artwork.title}</h3>
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
                    {!['USD', 'EUR', 'GBP'].includes(artwork.currency) && ` ${artwork.currency}`}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
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
