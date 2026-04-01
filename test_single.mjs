import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const res = await supabase.from('referral_codes').select('*').eq('referrer_id', '974f231b-6f9c-409d-91f6-ad9f13a421d9').single();
    console.log(res);
}
run();
