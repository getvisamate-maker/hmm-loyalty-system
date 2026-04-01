import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function signInAndCheck() {
  const { data: { session }, error: signerr } = await supabase.auth.signInWithPassword({
    email: 'hiteshbhtt6@gmail.com',
    password: 'password123!' // Try common password format
  });

  if (signerr) {
    console.error("Sign in failed:", signerr.message);
    return;
  }
  
  console.log("Got session for User ID:", session.user.id);
  
  const { data: refCodes, error: refErr } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('referrer_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('Codes fetchable:', refCodes, refErr);
}
signInAndCheck();
