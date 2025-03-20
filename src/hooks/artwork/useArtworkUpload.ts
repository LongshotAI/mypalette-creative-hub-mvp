
import { useState } from 'react';
import { uploadArtworkImage } from '@/services/api/artwork.api';
import { toast } from 'sonner';

export const useArtworkUpload = () => {
  const [imageUploading, setImageUploading] = useState(false);
  
  const handleArtworkImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string,
    onSuccess: (imageUrl: string) => void
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    setImageUploading(true);
    
    try {
      const response = await uploadArtworkImage(file, userId);
      
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      
      const imageUrl = response.data as string;
      onSuccess(imageUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  return {
    imageUploading,
    handleArtworkImageUpload
  };
};
