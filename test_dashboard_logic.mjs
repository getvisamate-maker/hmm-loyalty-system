import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const userId = '974f231b-6f9c-409d-91f6-ad9f13a421d9'; // hiteshbhtt6@gmail.com

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  const isAdmin = true;

  const isApprovedPartner = profile?.is_partner === true || profile?.role === 'cafe_owner' || profile?.role === 'super_admin' || isAdmin; 
  console.log("Is showing Partner dashboard?", isApprovedPartner);

  const { data: referralCode } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log('Referral Code:', referralCode);
}
check();
