
export interface EducationResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  description: string;
  author: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  external_url?: string;
  file_url?: string;
}

export interface APIResponse<T> {
  status: string;
  data: T;
  error?: {
    message: string;
  };
}
