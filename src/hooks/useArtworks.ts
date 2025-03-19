
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkFormData } from '@/types/portfolio';
import { toast } from 'sonner';

export const useArtworks = (userId: string | undefined) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  
  const [artworkForm, setArtworkForm] = useState<ArtworkFormData>({
    title: '',
    description: '',
    image_url: '',
    price: '',
    currency: 'USD',
    for_sale: false
  });

  const loadPortfolioArtworks = async (portfolioId: string) => {
    try {
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('portfolio_id', portfolioId);
      
      switch (sortOrder) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setArtworks(data || []);
    } catch (error) {
      console.error('Error loading artworks:', error);
      toast.error('Failed to load portfolio artworks');
    }
  };

  const handleArtworkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;
    
    const file = e.target.files[0];
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be less than 15MB');
      return;
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      toast.error('File must be an image (JPG, PNG, or GIF)');
      return;
    }
    
    setImageUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);
      
      setArtworkForm({
        ...artworkForm,
        image_url: publicUrl
      });
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const createArtwork = async (portfolioId: string) => {
    if (!userId || !portfolioId) return;
    
    setFormSubmitting(true);
    
    try {
      if (!artworkForm.image_url) {
        toast.error('Please upload an image for your artwork');
        setFormSubmitting(false);
        return;
      }
      
      const newArtwork = {
        portfolio_id: portfolioId,
        title: artworkForm.title,
        description: artworkForm.description,
        image_url: artworkForm.image_url,
        price: artworkForm.price ? parseFloat(artworkForm.price) : null,
        currency: artworkForm.currency,
        for_sale: artworkForm.for_sale
      };
      
      const { error } = await supabase
        .from('artworks')
        .insert([newArtwork]);
      
      if (error) throw error;
      
      toast.success('Artwork added successfully');
      setArtworkFormOpen(false);
      
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      await loadPortfolioArtworks(portfolioId);
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error('Failed to add artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const updateArtwork = async (portfolioId: string) => {
    if (!editingArtwork) return;
    
    setFormSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: artworkForm.title,
          description: artworkForm.description,
          image_url: artworkForm.image_url,
          price: artworkForm.price ? parseFloat(artworkForm.price) : null,
          currency: artworkForm.currency,
          for_sale: artworkForm.for_sale
        })
        .eq('id', editingArtwork.id);
      
      if (error) throw error;
      
      toast.success('Artwork updated successfully');
      setArtworkFormOpen(false);
      
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      setEditingArtwork(null);
      
      await loadPortfolioArtworks(portfolioId);
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const deleteArtwork = async (artworkId: string, portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId);
      
      if (error) throw error;
      
      toast.success('Artwork deleted successfully');
      
      await loadPortfolioArtworks(portfolioId);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  const editArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setArtworkForm({
      title: artwork.title,
      description: artwork.description,
      image_url: artwork.image_url,
      price: artwork.price?.toString() || '',
      currency: artwork.currency,
      for_sale: artwork.for_sale
    });
    setArtworkFormOpen(true);
  };

  const resetArtworkForm = () => {
    setEditingArtwork(null);
    setArtworkForm({
      title: '',
      description: '',
      image_url: '',
      price: '',
      currency: 'USD',
      for_sale: false
    });
  };

  return {
    artworks,
    setArtworks,
    artworkFormOpen,
    setArtworkFormOpen,
    formSubmitting,
    imageUploading,
    sortOrder,
    setSortOrder,
    editingArtwork,
    artworkForm,
    setArtworkForm,
    loadPortfolioArtworks,
    handleArtworkImageUpload,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    editArtwork,
    resetArtworkForm
  };
};
