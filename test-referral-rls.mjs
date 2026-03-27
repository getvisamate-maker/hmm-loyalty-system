import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy");

async function test() {
  const { data, error } = await supabase.from("referral_codes").select("*");
  console.log("Error:", error);
  console.log("Data via anon key:", data);
}
test();
