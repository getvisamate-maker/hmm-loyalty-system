import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Wipe any Supabase/auth-related cookies unconditionally
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase') || cookie.name.includes('csrf')) {
      cookieStore.delete(cookie.name);
    }
  });

  return NextResponse.redirect(new URL('/login', request.url));
}
