
-- Create a function to create the platform_settings table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_settings_table()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'platform_settings'
  ) THEN
    -- Create the table
    EXECUTE '
      CREATE TABLE public.platform_settings (
        id SERIAL PRIMARY KEY,
        site_name TEXT NOT NULL DEFAULT ''MyPalette'',
        site_description TEXT DEFAULT ''The digital portfolio platform for artists'',
        maintenance_mode BOOLEAN DEFAULT FALSE,
        featured_artists_limit INTEGER DEFAULT 6,
        registration_open BOOLEAN DEFAULT TRUE,
        featured_portfolios UUID[] DEFAULT ''{}''::UUID[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Insert initial default settings
      INSERT INTO public.platform_settings (
        site_name, 
        site_description, 
        maintenance_mode, 
        featured_artists_limit, 
        registration_open
      ) VALUES (
        ''MyPalette'', 
        ''The digital portfolio platform for artists'', 
        FALSE, 
        6, 
        TRUE
      );
    ';
  END IF;
END;
$$;

-- Create a function to update platform settings
CREATE OR REPLACE FUNCTION public.update_platform_settings(
  p_site_name TEXT,
  p_site_description TEXT,
  p_maintenance_mode BOOLEAN,
  p_featured_artists_limit INTEGER,
  p_registration_open BOOLEAN,
  p_featured_portfolios UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings JSONB;
BEGIN
  -- Make sure settings table exists
  PERFORM create_settings_table();
  
  -- Check if admin
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Only administrators can update platform settings';
  END IF;
  
  -- Update or insert settings
  IF EXISTS (SELECT 1 FROM public.platform_settings LIMIT 1) THEN
    UPDATE public.platform_settings
    SET 
      site_name = p_site_name,
      site_description = p_site_description,
      maintenance_mode = p_maintenance_mode,
      featured_artists_limit = p_featured_artists_limit,
      registration_open = p_registration_open,
      featured_portfolios = p_featured_portfolios,
      updated_at = NOW()
    WHERE id = (SELECT id FROM public.platform_settings ORDER BY id LIMIT 1)
    RETURNING to_jsonb(platform_settings.*) INTO v_settings;
  ELSE
    INSERT INTO public.platform_settings (
      site_name,
      site_description,
      maintenance_mode,
      featured_artists_limit,
      registration_open,
      featured_portfolios
    ) VALUES (
      p_site_name,
      p_site_description,
      p_maintenance_mode,
      p_featured_artists_limit,
      p_registration_open,
      p_featured_portfolios
    )
    RETURNING to_jsonb(platform_settings.*) INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$;

-- Create a function to get platform settings
CREATE OR REPLACE FUNCTION public.get_platform_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_settings JSONB;
BEGIN
  -- Make sure settings table exists
  PERFORM create_settings_table();
  
  -- Get settings
  SELECT to_jsonb(platform_settings.*) INTO v_settings
  FROM public.platform_settings
  ORDER BY id
  LIMIT 1;
  
  RETURN v_settings;
END;
$$;
