import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
  // It looks like secret_key column REALLY is missing, let's inject a new sql query and run via rpc or something, or we can just fetch without throwing error
  const { data, error } = await supabase.from('cafe_secrets').select('*');
  console.log(data);
}
fix();
