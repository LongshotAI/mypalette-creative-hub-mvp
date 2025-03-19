
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
// Get these from your Supabase project settings → API
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured correctly
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== 'https://your-project-id.supabase.co' && 
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};
