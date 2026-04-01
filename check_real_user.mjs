import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const theUser = users.users.find(u => u.email === "hiteshbhtt6@gmail.com");
  
  if (!theUser) {
    console.log("USER NOT FOUND");
    return;
  }
  
  console.log("Real Auth ID for hiteshbhtt6@gmail.com:", theUser.id);
  
  const { data: code } = await supabase.from("referral_codes").select("*").eq("referrer_id", theUser.id);
  console.log("Codes for this user:", code);
}
test();
