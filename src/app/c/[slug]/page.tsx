import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LoyaltyCard } from "./loyalty-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Ensure page is not statically generated so auth works
export const dynamic = "force-dynamic";

export default async function CustomerPage(props: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch User (Auth Check)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    return redirect(`/login?next=/c/${resolvedParams.slug}`);
  }

  // 2. Fetch Cafe Details
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!cafe) {
    return notFound();
  }

  // 3. Fetch or Create Loyalty Card
  let { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("cafe_id", cafe.id)
    .eq("user_id", user.id)
    .single();

  // Auto-join program if accessing the link
  if (!card) {
    // Try standard insertion first
    const { data: newCard, error: insertError } = await supabase
      .from("loyalty_cards")
      .insert({
        cafe_id: cafe.id,
        user_id: user.id,
        stamp_count: 0
      })
      .select()
      .single();
    
    if (newCard) {
      card = newCard;
    } else {
      // Fallback: If RLS blocks insertion, use Admin Client to create the card
      console.warn("Standard join failed (likely RLS), attempting admin fallback:", insertError?.message);
      
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const adminDb = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } }
        );

        const { data: adminCard, error: adminError } = await adminDb
          .from("loyalty_cards")
          .insert({
            cafe_id: cafe.id,
            user_id: user.id,
            stamp_count: 0
          })
          .select()
          .single();

        if (adminCard) {
          card = adminCard;
        } else {
          console.error("Admin join failed:", adminError);
        }
      }
    }
  }

  // Prevent server crash if card creation failed
  if (!card) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center text-zinc-500">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Membership Issue</h1>
            <p>Could not join the loyalty program at this time.</p>
            <p className="text-xs mt-2 opacity-50">Please contact support or cafe staff.</p>
            <Link href="/dashboard" className="mt-6 text-indigo-600 font-bold">Go to Dashboard</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col relative text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>
        {/* Optional: Add user profile menu or standard home link here */}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto relative z-0">
        <div className="w-full space-y-8 mt-12">
          <LoyaltyCard 
            cafeId={cafe.id}
            cardId={card.id}
            cafeName={cafe.name}
            stampsRequired={cafe.stamps_required}
            currentStamps={card?.stamp_count || 0}
            logoUrl={cafe.logo_url}
          />
          
          <div className="text-center space-y-4">
              <p className="text-xs text-zinc-400 font-medium">
                  Powered by Hmm Loyalty System
              </p>
          </div>
        </div>
      </main>
    </div>
  );
}