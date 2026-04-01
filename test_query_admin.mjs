import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: list } = await supabase.from('referral_codes').select('*');
    const { data: cafes } = await supabase.from('cafes').select('id, name, affiliate_id, status');
    console.log('Codes:', list);
    console.log('Cafes:', cafes);
}
run();
