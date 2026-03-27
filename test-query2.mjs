import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const r1 = await supabase.from("referral_codes").select("*, referrer:profiles(full_name)");
  console.log("Q1 Error:", r1.error?.message);
  console.log("Q1 Data:", r1.data);
}
test();
