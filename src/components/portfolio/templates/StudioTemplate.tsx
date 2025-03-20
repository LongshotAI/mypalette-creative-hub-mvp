
import React, { useState } from 'react';
import { Artwork } from '@/types/portfolio';
import ArtworkDetailModal from '../ArtworkDetailModal';

interface StudioTemplateProps {
  artworks: Artwork[];
}

const StudioTemplate = ({ artworks }: StudioTemplateProps) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
  };

  // Create a studio layout with some artworks on "walls" and some on "easels"
  const getPositionClass = (index: number) => {
    const positions = [
      "col-span-2 row-span-2", // Large feature piece
      "col-span-1 row-span-1 transform -rotate-1", // Wall piece
      "col-span-1 row-span-1 transform rotate-1", // Wall piece
      "col-span-1 row-span-2", // Vertical piece
      "col-span-2 row-span-1 transform -rotate-0.5", // Wide piece
      "col-span-1 row-span-1 transform rotate-2", // Small piece
    ];
    return positions[index % positions.length];
  };

  const getBgClass = (index: number) => {
    const backgrounds = [
      "bg-gray-100", // Light background
      "bg-stone-100", // Warm light background
      "bg-amber-50", // Warm off-white
      "bg-gray-50", // Off-white
    ];
    return backgrounds[index % backgrounds.length];
  };

  return (
    <div className="p-4 bg-stone-200 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4">
        {artworks.map((artwork, index) => (
          <div 
            key={artwork.id} 
            className={`${getPositionClass(index)} bg-card rounded-sm overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all duration-300`}
            onClick={() => openArtworkDetail(artwork)}
          >
            <div className={`relative p-2 ${getBgClass(index)}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-base">{artwork.title}</h3>
              {artwork.for_sale && artwork.price !== null && (
                <div className="text-primary font-medium mt-1 text-sm">
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

      {/* Decorative studio elements */}
      <div className="absolute -z-10 right-0 bottom-0 w-32 h-32 bg-orange-100/20 rounded-full blur-3xl"></div>
      <div className="absolute -z-10 left-20 top-40 w-64 h-64 bg-amber-100/10 rounded-full blur-3xl"></div>

      <ArtworkDetailModal 
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default StudioTemplate;
