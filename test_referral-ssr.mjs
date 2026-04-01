import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('Anon key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10));
