-- Add comprehensive branding support to cafes
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#4f46e5',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#fbbf24';

-- Ensure defaults for existing rows
UPDATE public.cafes SET primary_color = '#4f46e5' WHERE primary_color IS NULL;
UPDATE public.cafes SET secondary_color = '#fbbf24' WHERE secondary_color IS NULL;

