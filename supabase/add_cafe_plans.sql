-- Add plan_level to cafes table
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS plan_level text DEFAULT 'standard';

-- Optional: Add check constraint
ALTER TABLE public.cafes 
ADD CONSTRAINT cafes_plan_check 
CHECK (plan_level IN ('standard', 'growth', 'pro'));
