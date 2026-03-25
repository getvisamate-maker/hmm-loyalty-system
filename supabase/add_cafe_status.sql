-- Add status column to cafes table
alter table public.cafes 
add column if not exists status text default 'active';

-- Add check constraint for status values
alter table public.cafes 
add constraint cafes_status_check 
check (status in ('active', 'suspended'));
