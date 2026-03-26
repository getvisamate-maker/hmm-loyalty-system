-- Ensure cafe_secrets table exists securely
CREATE TABLE IF NOT EXISTS public.cafe_secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_id uuid REFERENCES public.cafes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pin_code text,
  secret_key text DEFAULT gen_random_uuid()::text, -- For dynamic QR code signing
  created_at timestamptz DEFAULT now()
);

-- Secure it: Only Service Role can access directly (or specific admin functions)
ALTER TABLE public.cafe_secrets ENABLE ROW LEVEL SECURITY;

-- No public access policies.
-- Access is handled via Secure Server Actions or Postgres functions.

-- Add index
CREATE INDEX IF NOT EXISTS idx_cafe_secrets_cafe_id ON public.cafe_secrets(cafe_id);

-- Ensure security_mode allows 'dynamic_qr' (it's text, so just for documentation)
-- Update cafes to default to 'visual' if null
UPDATE public.cafes SET security_mode = 'visual' WHERE security_mode IS NULL;
