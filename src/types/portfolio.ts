
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  template: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
}

export interface PortfolioFormData {
  name: string;
  description: string;
  template: string;
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
}

export interface ArtworkFormData {
  title: string;
  description: string;
  image_url: string;
  price: string;
  currency: string;
  for_sale: boolean;
}

// Updated interface for the portfolio with artist information
export interface PortfolioWithArtist {
  id: string;
  name: string;
  description: string;
  template: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    contact_email: string | null;
    location?: string | null;
    artist_statement?: string | null;
    current_exhibition?: string | null;
  };
}
