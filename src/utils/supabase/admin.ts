import { createClient } from '@supabase/supabase-js';

// This client bypasses Row Level Security (RLS). 
// NEVER use this on the frontend. ONLY use it in Server Actions or API routes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}