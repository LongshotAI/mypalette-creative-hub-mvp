
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
