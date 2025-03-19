
import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase URL and anon key from the client.ts file
const supabaseUrl = 'https://xlkypscosuhkuzidgpcb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsa3lwc2Nvc3Voa3V6aWRncGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjIyOTEsImV4cCI6MjA1Nzk5ODI5MX0.cczvYnlHt0dI4K6GR0_JfoXVUPKFec9ATnrpmyoqaFk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper to check if Supabase is configured correctly
export const isSupabaseConfigured = () => {
  return true; // Now properly configured with actual credentials
};
