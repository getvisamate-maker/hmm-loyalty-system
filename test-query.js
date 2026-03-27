import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:5432",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy"
);

async function test() {
  const { data, error } = await supabase.from("referral_codes").select("*, referrer:profiles(full_name, email)");
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
