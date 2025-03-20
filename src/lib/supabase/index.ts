
import { AdminType } from '@/types/admin';
import { supabase, isSupabaseConfigured } from './client';
import { getUserProfile, isKingAdminEmail } from './profiles';
import { getUserPortfolios, getPortfolioArtworks, uploadArtworkImage } from './portfolios';
import { 
  getEducationResources, 
  toggleFavoriteResource, 
  getUserFavorites, 
  getEducationCategories,
  createOrUpdateEducationResource,
  deleteEducationResource
} from './education';
import { 
  getOpenCalls, 
  getUserSubmissions, 
  submitOpenCallApplication,
  getAllSubmissions,
  updateSubmissionStatus
} from './openCalls';
import {
  getAllOrders,
  updateOrderStatus
} from './orders';
import {
  checkAdminStatus,
  getAllAdmins,
  updateAdminRole
} from './admin';

// Re-export everything
export {
  // Base client
  supabase,
  isSupabaseConfigured,
  
  // User profiles
  getUserProfile,
  isKingAdminEmail,
  
  // Portfolios and artworks
  getUserPortfolios,
  getPortfolioArtworks,
  uploadArtworkImage,
  
  // Education resources
  getEducationResources,
  toggleFavoriteResource,
  getUserFavorites,
  getEducationCategories,
  createOrUpdateEducationResource,
  deleteEducationResource,
  
  // Open calls
  getOpenCalls,
  getUserSubmissions,
  submitOpenCallApplication,
  getAllSubmissions,
  updateSubmissionStatus,
  
  // Orders
  getAllOrders,
  updateOrderStatus,
  
  // Admin functions
  checkAdminStatus,
  getAllAdmins,
  updateAdminRole
};
