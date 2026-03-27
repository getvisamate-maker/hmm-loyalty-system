import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'hiteshbhtt6@gmail.com',
    password: 'password123' // hope this is it
  });
  if (authErr) console.log('Auth err:', authErr.message);

  const { data: code, error: cErr } = await supabase.from('referral_codes').select('*');
  console.log('Code via anon:', code, cErr);
}
check();
