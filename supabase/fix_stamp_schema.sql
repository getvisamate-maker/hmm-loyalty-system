-- Add security columns to cafes table
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS security_mode text DEFAULT 'visual'; -- visual, pin, dynamic_qr, etc.
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS time_lock_hours integer DEFAULT 0; -- Minimum hours between stamps

-- Add timestamp tracking to loyalty_cards
ALTER TABLE public.loyalty_cards ADD COLUMN IF NOT EXISTS last_stamped_at timestamptz;

-- Add notes to stamp_logs if missing
ALTER TABLE public.stamp_logs ADD COLUMN IF NOT EXISTS notes text;

-- Ensure RLS allows users to insert their own logs (maybe not, usually server action does it)
-- But ensuring the efficient fetch in actions.ts works
CREATE POLICY "Cafe owners can view logs for their cafe" ON public.stamp_logs FOR SELECT USING (
  auth.uid() IN (
    SELECT owner_id FROM public.cafes 
    WHERE id = (SELECT cafe_id FROM public.loyalty_cards WHERE id = card_id)
  )
);
