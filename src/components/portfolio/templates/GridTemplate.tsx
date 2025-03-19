
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';

interface GridTemplateProps {
  artworks: Artwork[];
}

const GridTemplate = ({ artworks }: GridTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div 
            key={artwork.id} 
            className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openArtworkDetail(artwork)}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{artwork.title}</h3>
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
    </div>
  );
};

export default GridTemplate;
