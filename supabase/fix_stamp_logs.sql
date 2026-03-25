-- Fix missing notes column in stamp_logs
alter table public.stamp_logs 
add column if not exists notes text;
