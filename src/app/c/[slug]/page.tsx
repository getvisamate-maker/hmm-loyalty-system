import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Coffee, CheckCircle2 } from "lucide-react";

export default async function CafeRewardPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await props.params;
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in, force them to login and then come back to this cafe's page
    return redirect(`/login?message=Please log in to claim your stamp&next=/c/${resolvedParams.slug}`);
  }

  // 2. Fetch the Cafe based on the URL slug
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-black dark:text-white pb-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cafe Not Found</h1>
          <p className="text-zinc-500">This QR code might be invalid.</p>
        </div>
      </div>
    );
  }

  // 3. Fetch or Create the user's loyalty card for this specific cafe
  let { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("cafe_id", cafe.id)
    .single();

  if (!card) {
    const adminSupabase = createAdminClient();
    // Auto-create a card for them since they successfully scanned the code
    const { data: newCard } = await adminSupabase
      .from("loyalty_cards")
      .insert({ user_id: user.id, cafe_id: cafe.id, stamp_count: 0 })
      .select()
      .single();
    card = newCard;
  }

  const stamps = card?.stamp_count || 0;
  const stampsRequired = cafe.stamps_required || 10;
  const isRewardReady = stamps >= stampsRequired;

  // Security checks
  const securityMode = cafe.security_mode || 'visual'; // 'visual', 'pin_code', or 'time_lock'
  const timeLockHours = cafe.time_lock_hours || 2;
  
  let canClaim = true;
  let timeLockMessage = "";

  if (securityMode === 'time_lock' && card && card.stamp_count > 0 && !isRewardReady) {
    // If using time_lock, calculate hours since last updated_at (which we set on every claim)
    const currentTime = new Date().getTime(); // Standard js Date
    const hoursSince = (currentTime - new Date(card.updated_at).getTime()) / (1000 * 60 * 60);
    if (hoursSince < timeLockHours) {
      canClaim = false;
      const waitMinutes = Math.ceil((timeLockHours - hoursSince) * 60);
      const hours = Math.floor(waitMinutes / 60);
      const mins = waitMinutes % 60;
      timeLockMessage = `Next stamp available in ${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    }
  }

  // Server Action to add a stamp
  const claimStamp = async (formData: FormData) => {
    "use server";
    
    // We use the admin client so we can securely bypass Row Level Security 
    // to increment the stamp without allowing users to edit it directly from the browser.
    const adminActionSupabase = createAdminClient();

    if (!card) return;

    // PIN check if applicable
    if (cafe.security_mode === 'pin_code') {
      const pin = formData.get("pin");
      if (pin !== cafe.pin_code) {
        redirect(`/c/${resolvedParams.slug}?error=Invalid PIN Code`);
      }
    }

    // Increment stamp count and update timestamp
    const { data: updatedCard, error } = await adminActionSupabase
      .from("loyalty_cards")
      .update({ 
        stamp_count: card.stamp_count + 1,
        updated_at: new Date().toISOString() 
      })
      .eq("id", card.id)
      .select()
      .single();

    if (!error && updatedCard) {
      // Log the stamp for fraud prevention
      await adminActionSupabase.from("stamp_logs").insert({ card_id: card.id });
    }
    
    // Refresh page
    revalidatePath(`/c/${resolvedParams.slug}`);
  };

  // Server Action to redeem the reward and reset stamps
  const redeemReward = async () => {
    "use server";
    
    const adminActionSupabase = createAdminClient();

    if (!card) return;

    // Reset stamp count back to 0 (or subtract the required stamps)
    const newStampCount = Math.max(0, card.stamp_count - stampsRequired);

    await adminActionSupabase
      .from("loyalty_cards")
      .update({ stamp_count: newStampCount })
      .eq("id", card.id);
    
    // Refresh page
    revalidatePath(`/c/${resolvedParams.slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-black pt-12 px-6 sm:px-12 font-sans font-[family-name:var(--font-geist-sans)]">
      
      {/* Header */ }
      <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white dark:bg-zinc-900 rounded-full shadow-md mb-4 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {cafe.logo_url ? (
            <img src={cafe.logo_url} alt={`${cafe.name} logo`} className="w-full h-full object-cover" />
          ) : (
            <Coffee size={32} className="text-black dark:text-white" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-black dark:text-white">{cafe.name}</h1>
        <p className="text-zinc-500 mt-2">
          {stamps} / {stampsRequired} stamps collected
        </p>
      </div>

      {/* The Punch Card UI */ }
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 w-full max-w-sm shadow-xl mb-12">
        <div className="grid grid-cols-5 gap-y-6 gap-x-2 justify-items-center">
          {Array.from({ length: stampsRequired }).map((_, i) => {
            const isStamped = i < stamps;
            return (
              <div 
                key={i} 
                className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${isStamped 
                    ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black scale-110" 
                    : "bg-zinc-50 border-dashed border-zinc-300 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-300 dark:text-zinc-800"}
                `}
              >
                {isStamped ? (
                   <Coffee size={20} className="animate-in zoom-in duration-300" />
                ) : (
                   <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Area */ }
      <div className="w-full max-w-sm">
        {isRewardReady ? (
          <div className="bg-green-500 text-white rounded-2xl p-6 text-center shadow-lg shadow-green-500/20 animate-in zoom-in duration-500">
            <CheckCircle2 size={48} className="mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-1">Free Coffee Unlocked!</h2>
            <p className="text-green-100 text-sm mb-4">Show this screen to the barista to claim your reward.</p>
            <form action={redeemReward}>
              <button className="bg-white text-green-600 font-bold py-3 px-6 rounded-xl w-full hover:bg-green-50 transition-colors">
                Mark as Redeemed
              </button>
            </form>
          </div>
        ) : (
          <form action={claimStamp} className="flex flex-col gap-3">
            {securityMode === "pin_code" && (
              <div className="flex flex-col mb-2">
                <label className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-1 pl-1">Barista PIN Code</label>
                <input 
                  type="password"
                  name="pin"
                  maxLength={4}
                  placeholder="Ask Barista for PIN"
                  className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center tracking-widest text-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-black dark:text-white"
                  required
                />
              </div>
            )}
            
            {searchParams?.error && (
              <p className="text-red-500 text-center text-sm font-medium bg-red-500/10 py-2 rounded-lg">{searchParams.error}</p>
            )}

            {securityMode === "time_lock" && !canClaim ? (
              <button disabled className="w-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-lg font-semibold py-4 rounded-2xl shadow-sm cursor-not-allowed flex flex-col items-center">
                <span>Waiting Period</span>
                <span className="text-sm font-normal">{timeLockMessage}</span>
              </button>
            ) : (
              <button className="w-full bg-black dark:bg-white text-white dark:text-black text-lg font-semibold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                {securityMode === "visual" ? "Claim Stamp & Show Barista" : "Claim Stamp"}
              </button>
            )}
          </form>
        )}
        <a href="/dashboard" className="mt-4 block w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors text-center">
          Go to Your Dashboard
        </a>
      </div>

    </div>
  );
}