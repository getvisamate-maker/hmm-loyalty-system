-- Add detailed fields for cafes and security configuration
alter table public.cafes 
add column if not exists description text,
add column if not exists address text,
add column if not exists phone_number text,
add column if not exists instagram_url text,
add column if not exists security_mode text default 'visual',
add column if not exists pin_code text default '0000',
add column if not exists time_lock_hours numeric default 2;
