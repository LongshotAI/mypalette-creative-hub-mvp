
import { createClient } from '@supabase/supabase-js';

// These should be environment variables in production
// For this demo, we're using public values as these are client-side anyway
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
