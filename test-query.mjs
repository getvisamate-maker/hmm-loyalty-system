import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from("referral_codes").select("*, referrer:profiles!referrer_id(full_name, email)");
  console.log("Error profiles!referrer_id:", error);
  
  const { data: d2, error: e2 } = await supabase.from("referral_codes").select("*, profiles(full_name, email)");
  console.log("Error profiles:", e2);
  
  const { data: d3, error: e3 } = await supabase.from("referral_codes").select("*");
  console.log("Raw codes:", d3);
}
test();
