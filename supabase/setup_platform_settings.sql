
-- Create platform settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_name text DEFAULT 'MyPalette',
  site_description text DEFAULT 'The digital portfolio platform for artists',
  maintenance_mode boolean DEFAULT false,
  featured_artists_limit integer DEFAULT 6,
  registration_open boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create function to create settings table via RPC
CREATE OR REPLACE FUNCTION create_settings_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.platform_settings (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_name text DEFAULT 'MyPalette',
    site_description text DEFAULT 'The digital portfolio platform for artists',
    maintenance_mode boolean DEFAULT false,
    featured_artists_limit integer DEFAULT 6,
    registration_open boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
  );
END;
$$;

-- Insert default settings if table is empty
INSERT INTO public.platform_settings (site_name, site_description, maintenance_mode, featured_artists_limit, registration_open)
SELECT 'MyPalette', 'The digital portfolio platform for artists', false, 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Create RLS policy
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage settings
CREATE POLICY admin_manage_settings ON public.platform_settings 
  FOR ALL 
  TO authenticated 
  USING (exists (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.admin_type IS NOT NULL
  ));

-- Allow anyone to read settings
CREATE POLICY read_settings ON public.platform_settings 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);
