-- Add Growth Features to Cafes Table
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS enable_win_back BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS win_back_days INTEGER DEFAULT 14;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS win_back_reward_stamps INTEGER DEFAULT 1;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS google_review_url TEXT;
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS review_threshold INTEGER DEFAULT 3;

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload schema';
