import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LoyaltyCard } from "./loyalty-card";
import { DailyDelight } from "./daily-delight";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Ensure page is not statically generated so auth works
export const dynamic = "force-dynamic";

export default async function CustomerPage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ celebrate?: string, reviewUrl?: string }>
}) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
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

  // Check Status
  const plan = cafe.plan_level || 'standard';
  const isGrowthOrHigher = ['growth', 'pro'].includes(plan.toLowerCase());
  const isPro = plan.toLowerCase() === 'pro';
  
  // 14-day trial logic
  const createdAtDate = new Date(cafe.created_at);
  const now = new Date();
  const trialDays = 14;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceCreation = Math.floor((now.getTime() - createdAtDate.getTime()) / msPerDay);
  
  const isTrialExpired = daysSinceCreation > trialDays && plan === 'standard' && !cafe.stripe_subscription_id;

  if (isTrialExpired) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6">
          <span className="text-3xl">☕️</span>
        </div>
        <h1 className="text-3xl font-black mb-3 text-white">{cafe.name}</h1>
        <p className="text-zinc-400 font-medium mb-8 max-w-sm">
          This loyalty program is currently paused. Please notify the cafe staff.
        </p>
      </div>
    );
  }
  if (cafe.status === 'suspended') {
     return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                <AlertTriangle size={32} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Service Temporarily Unavailable</h1>
            <p className="max-w-xs mx-auto text-zinc-500">{cafe.name} is not accepting loyalty interactions at this moment.</p>
            <Link href="/dashboard" className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-full text-sm hover:bg-zinc-200 transition-colors">Return Home</Link>
        </div>
     );
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
        <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-sans">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 shadow-xl shadow-black/50">
                <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Membership Issue</h1>
            <p className="max-w-xs mx-auto text-sm leading-relaxed mb-8">We couldn&apos;t generate your pass right now. Please show this screen to the staff.</p>
            <Link href="/dashboard" className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
                Return to Dashboard
            </Link>
        </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30 flex flex-col">              
      {/* Dynamic Background Gradients */}            
      <div className="fixed inset-0 z-0 pointer-events-none">                    
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse" />                    
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] rounded-full bg-blue-900/10 blur-[100px]" />                             
      </div>

      {resolvedSearchParams.reviewUrl && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative">
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">⭐</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Loving {cafe.name}?</h2>
            <p className="text-zinc-400 mb-8 text-sm">We&apos;re so glad you&apos;re a loyal customer! Would you mind taking a quick second to leave us a 5-star review?</p>
            <div className="flex flex-col gap-3">
              <a 
                href={resolvedSearchParams.reviewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-xl shadow-white/10"
              >
                Yes, leave a review
              </a>
              <Link 
                href={`/c/${resolvedParams.slug}`} 
                replace
                className="w-full py-4 text-zinc-500 font-bold rounded-2xl hover:bg-zinc-800 transition-all text-sm"
              >
                No, maybe later
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="relative z-50 px-6 py-6 flex justify-between items-center w-full max-w-md mx-auto">
        <Link 
          href="/dashboard" 
          className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/5 transition-all text-white/80 hover:text-white hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Loyalty Pass</span>
            <span className="text-sm font-bold text-white tracking-tight">hmmLoyalty</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 shadow-lg shadow-indigo-500/20" />
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center w-full max-w-md mx-auto px-6 pb-8 pt-4">
        <div className="w-full h-full flex flex-col justify-between">
            <div className="space-y-6">
              <LoyaltyCard 
                cafeId={cafe.id}
                cardId={card.id}
                cafeName={cafe.name}
                description={cafe.description}
                stampsRequired={cafe.stamps_required}
                currentStamps={card?.stamp_count || 0}
                logoUrl={cafe.logo_url}
                primaryColor={cafe.primary_color}
                secondaryColor={cafe.secondary_color}
                theme={cafe.theme}
                stampIcon={cafe.stamp_icon}
                backgroundUrl={cafe.background_url}
              />                <DailyDelight />
            </div>

            <div className="mt-8 text-center pb-safe">
                <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                    Powered by Hmm Loyalty System
                </p>
            </div>
        </div>
      </main>
    </div>
  );
}