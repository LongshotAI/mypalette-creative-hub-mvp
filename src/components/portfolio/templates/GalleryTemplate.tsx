
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface GalleryTemplateProps {
  artworks: Artwork[];
}

const GalleryTemplate = ({ artworks }: GalleryTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
  };

  const handleZoomImage = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    setZoomImage(imageUrl);
    setZoomModalOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {artworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className="group bg-card rounded-md overflow-hidden border border-border"
            onClick={() => openArtworkDetail(artwork)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="bg-white/80 text-black p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform"
                  onClick={(e) => handleZoomImage(e, artwork.image_url)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                  <span className="sr-only">Zoom</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{artwork.title}</h3>
              {artwork.for_sale && artwork.price !== null && (
                <div className="text-primary font-medium mt-2">
                  {artwork.currency === 'USD' && '$'}
                  {artwork.currency === 'EUR' && '€'}
                  {artwork.currency === 'GBP' && '£'}
                  {artwork.price}
                  {!['USD', 'EUR', 'GBP'].includes(artwork.currency) && ` ${artwork.currency}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      <Dialog open={zoomModalOpen} onOpenChange={setZoomModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-2">
          {zoomImage && (
            <div className="overflow-auto h-full flex items-center justify-center">
              <img 
                src={zoomImage} 
                alt="Zoomed artwork" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryTemplate;
