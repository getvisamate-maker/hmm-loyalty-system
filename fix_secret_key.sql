ALTER TABLE IF EXISTS public.cafe_secrets 
ADD COLUMN IF NOT EXISTS secret_key text DEFAULT gen_random_uuid()::text;
