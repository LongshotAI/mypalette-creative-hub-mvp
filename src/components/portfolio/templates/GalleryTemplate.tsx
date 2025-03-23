
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ZoomIn, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface GalleryTemplateProps {
  artworks: Artwork[];
  onArtworkView?: (artworkId: string) => void;
}

const GalleryTemplate = ({ artworks = [], onArtworkView }: GalleryTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const isMobile = useIsMobile();

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
    // Call the onArtworkView function if it exists
    if (onArtworkView) {
      onArtworkView(artwork.id);
    }
  };

  const handleZoomImage = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setZoomImage(imageUrl);
    setZoomScale(1); // Reset zoom level
    setZoomModalOpen(true);
  };

  const handleZoomIn = () => {
    setZoomScale(Math.min(zoomScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomScale(Math.max(zoomScale - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomScale(1);
  };

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

  // For very large collections, limit display
  const displayArtworks = artworks.length > 100 ? artworks.slice(0, 100) : artworks;

  return (
    <div className="py-2">
      <motion.div 
        className={`grid grid-cols-1 sm:grid-cols-2 ${isMobile ? '' : 'lg:grid-cols-3'} gap-4 sm:gap-6 md:gap-8 p-2 sm:p-4`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {displayArtworks.map((artwork) => (
            <motion.div 
              key={artwork.id} 
              className="group bg-card rounded-md overflow-hidden border border-border shadow hover:shadow-lg transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -5 }}
              layout
            >
              <div 
                className="relative aspect-square overflow-hidden cursor-pointer"
                onClick={() => openArtworkDetail(artwork)}
              >
                <motion.img 
                  src={artwork.image_url} 
                  alt={artwork.title || 'Untitled artwork'}
                  className="w-full h-full object-cover transition-all duration-500"
                  whileHover={{ scale: 1.05 }}
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                  }}
                />
                <motion.div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="flex gap-2">
                    <motion.button 
                      className="bg-white/90 text-black p-3 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleZoomImage(e, artwork.image_url)}
                    >
                      <ZoomIn className="h-5 w-5" />
                      <span className="sr-only">Zoom</span>
                    </motion.button>
                    
                    <motion.button 
                      className="bg-white/90 text-black p-3 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openArtworkDetail(artwork);
                      }}
                    >
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Details</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
              <motion.div 
                className="p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{artwork.title || 'Untitled'}</h3>
                {artwork.description && (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{artwork.description}</p>
                )}
                {artwork.for_sale && artwork.price !== null && (
                  <div className="text-primary font-medium mt-3 flex items-center flex-wrap gap-2">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
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
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {artworks.length > 100 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            Showing the first 100 artworks. Contact the artist to see more work.
          </p>
        </div>
      )}

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Enhanced zoom modal with controls */}
      <Dialog open={zoomModalOpen} onOpenChange={setZoomModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-2 overflow-hidden">
          {zoomImage && (
            <div className="relative h-full flex flex-col">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn size={18} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomIn size={18} className="rotate-180" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomReset}>
                  <X size={18} />
                </Button>
              </div>
              
              <div className="overflow-auto h-full flex items-center justify-center bg-black/5 rounded-md">
                <motion.img 
                  src={zoomImage} 
                  alt="Zoomed artwork" 
                  className="max-w-full max-h-[80vh] object-contain cursor-move"
                  style={{ scale: zoomScale }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: zoomScale, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  drag
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragElastic={0.1}
                  onError={(e) => {
                    // Fallback for broken images
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                    (e.target as HTMLImageElement).classList.add('p-8', 'bg-muted/20');
                  }}
                />
              </div>
              
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Drag to pan • Use buttons to zoom or reset
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryTemplate;
