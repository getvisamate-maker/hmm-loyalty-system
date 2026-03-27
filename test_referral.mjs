import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: users, error: uErr } = await supabase.from('profiles').select('id, full_name, role');
  console.log('Users:', users);
  
  const { data: codes, error: cErr } = await supabase.from('referral_codes').select('*');
  console.log('Codes:', codes);
}
check();
