import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: code } = await supabase.from("referral_codes").select("*").limit(1).single();
  // emulate the dashboard fetch but using anon privileges for the specific user id... wait, local node script doesn't have the cookies so it runs completely unauthenticated if we use anon key.
  console.log(code);
}
test();
