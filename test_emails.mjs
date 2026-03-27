import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers();
  users.forEach(u => console.log(u.email, u.id));
}
check();
