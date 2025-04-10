
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  template: string;
  theme: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;  // Add this line to include the updated_at property
}

export interface PortfolioFormData {
  name: string;
  description: string;
  template: string;
  theme: string;
  is_public: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number | null;
  currency: string;
  for_sale: boolean;
  portfolio_id: string;
  created_at: string;
  quantity?: number | null;
  sold_out?: boolean;
  portfolios?: {
    user_id: string;
    name?: string;
    id?: string;
    profiles?: {
      id?: string;
      username?: string;
      full_name?: string;
    }
  };
}

export interface ArtworkFormData {
  title: string;
  description: string;
  image_url: string;
  price: string;
  currency: string;
  for_sale: boolean;
}

export interface PortfolioWithArtist {
  id: string;
  name: string;
  description: string;
  template: string;
  theme: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    banner_image_url: string | null;
    bio: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    contact_email: string | null;
    location: string | null;
    artist_statement: string | null;
    current_exhibition: string | null;
  };
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preview_image_url: string | null;
  settings: Record<string, any>;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Order {
  id: string;
  buyer_id: string;
  artwork_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_session_id?: string;
  created_at: string;
  seller_notified?: boolean;
  artworks?: Artwork & {
    portfolios?: {
      id: string;
      name: string;
      user_id: string;
      profiles?: {
        id: string;
        username: string;
        full_name?: string;
      }
    }
  };
}

export type OrderStatus = 'all' | 'pending' | 'completed' | 'failed';

// Template types for clear representation in the UI
export type PortfolioTemplateType = 'grid' | 'masonry' | 'slideshow' | 'minimal' | 'gallery' | 'studio';

// Theme types for consistent styling
export type PortfolioThemeType = 'default' | 'minimal' | 'bold' | 'elegant' | 'dark';
