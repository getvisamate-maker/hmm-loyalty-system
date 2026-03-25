-- Add notes column to stamp_logs for tracking redemptions
ALTER TABLE public.stamp_logs 
ADD COLUMN IF NOT EXISTS notes text;

-- Add index on notes for faster analytical queries
CREATE INDEX IF NOT EXISTS idx_stamp_logs_notes ON public.stamp_logs(notes);
