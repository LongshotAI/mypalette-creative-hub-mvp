
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';

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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4">
            {column.map((artwork: Artwork) => (
              <div 
                key={artwork.id} 
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openArtworkDetail(artwork)}
              >
                <div className={`overflow-hidden ${columnIndex === 1 ? 'aspect-[3/4]' : 'aspect-square'}`}>
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

export default MasonryTemplate;
