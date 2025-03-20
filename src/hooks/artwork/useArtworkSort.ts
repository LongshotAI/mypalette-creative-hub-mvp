
import { useState } from 'react';

export const useArtworkSort = () => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');
  
  return {
    sortOrder,
    setSortOrder
  };
};
