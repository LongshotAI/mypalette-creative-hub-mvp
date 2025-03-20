
import { supabase } from './supabase';

export type SearchResult = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  type: 'portfolio' | 'artist' | 'opencall' | 'education';
  username?: string;
  full_name?: string;
  created_at: string;
  url: string;
};

export type SearchFilters = {
  type?: string;
  category?: string;
};

export const searchAll = async (query: string, filters: SearchFilters = {}): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;
  const results: SearchResult[] = [];

  try {
    const searchPromises = [];
    
    if (!filters.type || filters.type === 'all' || filters.type === 'portfolio') {
      const portfolioPromise = supabase
        .from('portfolios')
        .select(`
          id, 
          name, 
          description, 
          created_at,
          user_id,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .eq('is_public', true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10)
        .then(response => response);
      
      searchPromises.push(portfolioPromise);
    }
    
    if (!filters.type || filters.type === 'all' || filters.type === 'artist') {
      const artistPromise = supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .limit(10)
        .then(response => response);
      
      searchPromises.push(artistPromise);
    }
    
    if (!filters.type || filters.type === 'all' || filters.type === 'opencall') {
      const openCallPromise = supabase
        .from('open_calls')
        .select('id, title, description, organization, category, image_url, created_at')
        .eq('status', 'open')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},organization.ilike.${searchTerm}`)
        .order('deadline', { ascending: true })
        .limit(10)
        .then(response => response);
      
      searchPromises.push(openCallPromise);
    }
    
    if (!filters.type || filters.type === 'all' || filters.type === 'education') {
      const resourcePromise = supabase
        .from('education_resources')
        .select('id, title, description, type, category, image_url, author, created_at')
        .eq('is_published', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},author.ilike.${searchTerm}`)
        .limit(10)
        .then(response => response);
      
      searchPromises.push(resourcePromise);
    }

    const responses = await Promise.all(searchPromises);
    
    // Handle portfolio results
    if (responses[0] && !responses[0].error) {
      const portfolioResults = responses[0].data.map((portfolio: any) => ({
        id: portfolio.id,
        title: portfolio.name,
        description: portfolio.description,
        type: 'portfolio' as const,
        username: portfolio.profiles?.username,
        full_name: portfolio.profiles?.full_name,
        image_url: null,
        created_at: portfolio.created_at,
        url: `/portfolio/${portfolio.id}`
      }));
      results.push(...portfolioResults);
    }
    
    // Handle artist results
    if (responses[1] && !responses[1].error) {
      const artistResults = responses[1].data.map((profile: any) => ({
        id: profile.id,
        title: profile.full_name || profile.username,
        description: profile.bio,
        type: 'artist' as const,
        username: profile.username,
        full_name: profile.full_name,
        image_url: profile.avatar_url,
        created_at: profile.created_at,
        url: `/user/${profile.id}`
      }));
      results.push(...artistResults);
    }
    
    // Handle open call results
    if (responses[2] && !responses[2].error) {
      const openCallResults = responses[2].data.map((call: any) => ({
        id: call.id,
        title: call.title,
        description: call.description,
        type: 'opencall' as const,
        username: call.organization,
        image_url: call.image_url,
        created_at: call.created_at,
        url: `/open-calls/${call.id}`
      }));
      results.push(...openCallResults);
    }
    
    // Handle education resource results
    if (responses[3] && !responses[3].error) {
      const resourceResults = responses[3].data.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: 'education' as const,
        username: resource.author,
        image_url: resource.image_url,
        created_at: resource.created_at,
        url: `/education/${resource.id}`
      }));
      results.push(...resourceResults);
    }
    
    return results.sort((a, b) => {
      const aExactMatch = a.title.toLowerCase() === query.toLowerCase();
      const bExactMatch = b.title.toLowerCase() === query.toLowerCase();
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
