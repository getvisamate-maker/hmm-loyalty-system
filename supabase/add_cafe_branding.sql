-- Add branding color support to cafes
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#4f46e5';
