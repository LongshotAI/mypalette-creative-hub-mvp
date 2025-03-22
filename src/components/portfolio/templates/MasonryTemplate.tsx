
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { motion } from 'framer-motion';

interface MasonryTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const MasonryTemplate = ({ artworks, onArtworkView }: MasonryTemplateProps) => {
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

  // Split artworks into columns for masonry effect
  const getColumns = () => {
    const columns = [[], [], []];
    artworks.forEach((artwork, index) => {
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

  return (
    <div className="py-4">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {columns.map((column, columnIndex) => (
          <motion.div 
            key={columnIndex} 
            className="flex flex-col gap-6"
            variants={columnVariants}
          >
            {column.map((artwork: Artwork) => (
              <motion.div 
                key={artwork.id} 
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative"
                onClick={() => openArtworkDetail(artwork)}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={`overflow-hidden ${columnIndex === 1 ? 'aspect-[3/4]' : columnIndex === 2 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                  <motion.img 
                    src={artwork.image_url} 
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">{artwork.title}</h3>
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
                        {!['USD', 'EUR', 'GBP'].includes(artwork.currency) && ` ${artwork.currency}`}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
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

export default MasonryTemplate;
