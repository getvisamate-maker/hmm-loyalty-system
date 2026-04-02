-- Add a column to track when the last win-back email was sent so we don't spam customers every day
ALTER TABLE public.loyalty_cards ADD COLUMN IF NOT EXISTS last_win_back_sent_at TIMESTAMP WITH TIME ZONE;

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload schema';
