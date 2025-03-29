
import { Artwork, ArtworkFormData } from '@/types/portfolio';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  supabase, 
  ApiResponse 
} from './base.api';

/**
 * Get all artworks for a portfolio
 */
export async function getPortfolioArtworks(
  portfolioId: string,
  sortOrder: 'newest' | 'oldest' | 'price_high' | 'price_low' = 'newest'
): Promise<ApiResponse<Artwork[]>> {
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
    
    return createSuccessResponse(data || []);
  } catch (error) {
    handleApiError(error, 'Failed to load portfolio artworks');
    return createErrorResponse(
      'Failed to load portfolio artworks', 
      error
    );
  }
}

/**
 * Get a single artwork by ID
 */
export async function getArtworkById(artworkId: string): Promise<ApiResponse<Artwork>> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to load artwork');
    return createErrorResponse(
      'Failed to load artwork', 
      error
    );
  }
}

/**
 * Upload artwork image to storage
 */
export async function uploadArtworkImage(file: File, userId: string): Promise<ApiResponse<string>> {
  try {
    if (file.size > 15 * 1024 * 1024) {
      return createErrorResponse('Image must be less than 15MB');
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      return createErrorResponse('File must be an image (JPG, PNG, or GIF)');
    }
    
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
    
    return createSuccessResponse(publicUrl);
  } catch (error) {
    handleApiError(error, 'Failed to upload image');
    return createErrorResponse(
      'Failed to upload image', 
      error
    );
  }
}

/**
 * Create a new artwork
 */
export async function createArtwork(
  portfolioId: string, 
  artworkData: ArtworkFormData
): Promise<ApiResponse<Artwork>> {
  try {
    if (!artworkData.image_url) {
      return createErrorResponse('Please upload an image for your artwork');
    }
    
    const newArtwork = {
      portfolio_id: portfolioId,
      title: artworkData.title,
      description: artworkData.description,
      image_url: artworkData.image_url,
      price: artworkData.price ? parseFloat(artworkData.price) : null,
      currency: artworkData.currency,
      for_sale: artworkData.for_sale,
      listing_url: artworkData.listing_url || null
    };
    
    const { data, error } = await supabase
      .from('artworks')
      .insert([newArtwork])
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to add artwork');
    return createErrorResponse(
      'Failed to add artwork', 
      error
    );
  }
}

/**
 * Update an existing artwork
 */
export async function updateArtwork(
  artworkId: string, 
  artworkData: ArtworkFormData
): Promise<ApiResponse<Artwork>> {
  try {
    const updates = {
      title: artworkData.title,
      description: artworkData.description,
      image_url: artworkData.image_url,
      price: artworkData.price ? parseFloat(artworkData.price) : null,
      currency: artworkData.currency,
      for_sale: artworkData.for_sale,
      listing_url: artworkData.listing_url || null
    };
    
    const { data, error } = await supabase
      .from('artworks')
      .update(updates)
      .eq('id', artworkId)
      .select()
      .single();
    
    if (error) throw error;
    
    return createSuccessResponse(data);
  } catch (error) {
    handleApiError(error, 'Failed to update artwork');
    return createErrorResponse(
      'Failed to update artwork', 
      error
    );
  }
}

/**
 * Delete an artwork
 */
export async function deleteArtwork(artworkId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId);
    
    if (error) throw error;
    
    return createSuccessResponse(null);
  } catch (error) {
    handleApiError(error, 'Failed to delete artwork');
    return createErrorResponse(
      'Failed to delete artwork', 
      error
    );
  }
}
