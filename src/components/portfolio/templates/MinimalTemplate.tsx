
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';

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

  return (
    <div className="space-y-16 py-4">
      {artworks.map((artwork) => (
        <div 
          key={artwork.id} 
          className="flex flex-col items-center"
        >
          <div 
            className="w-full max-w-3xl mx-auto cursor-pointer mb-4 hover:opacity-95 transition-opacity"
            onClick={() => openArtworkDetail(artwork)}
          >
            <img 
              src={artwork.image_url} 
              alt={artwork.title}
              className="w-full h-auto rounded-sm"
            />
          </div>
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-medium text-xl mb-2">{artwork.title}</h3>
            {artwork.description && (
              <p className="text-muted-foreground mb-3">{artwork.description}</p>
            )}
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

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default MinimalTemplate;
