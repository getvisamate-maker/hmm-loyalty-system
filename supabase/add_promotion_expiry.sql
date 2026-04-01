-- Add expires_at to promotions table
ALTER TABLE promotions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Since the feature was just added, we'll set existing promotions to expire 30 days from their creation if missing
UPDATE promotions 
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;
