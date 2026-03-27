import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Coffee, LogOut, Settings, QrCode, Shield, Gift, Megaphone, Users, TrendingUp, Search, ShieldUser } from "lucide-react";
import { ReferralBanner } from "@/components/ReferralBanner";

// Force Next.js to always render this page dynamically so affiliate stats are never stale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userEmail = user.email ? user.email.toLowerCase().trim() : "";
  const adminList = (process.env.ADMIN_EMAILS || "")
    .split(',')
    .map(e => e.toLowerCase().trim());

  const isAdmin = userEmail && adminList.includes(userEmail);
  
  // Determine if Partner/Owner
  // We check 'is_partner' (legacy boolean) OR 'role' === 'owner' (new system)
  // But strict "Partner" access usually requires approval (is_partner = true).
  // If they are just role='owner' but not approved, we might show a "Pending" dashboard or just the customer one with a note.
  // For now, let's treat requested owners as customers until approved, to match the admin flow.
  const isApprovedPartner = profile?.is_partner === true || profile?.role === 'cafe_owner' || profile?.role === 'super_admin' || isAdmin; // Allow admins to see owner view

  // Fetch Referral Code (if any)
  const { data: referralCode } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("referrer_id", user.id)
    .single();

  // If they have a code, let's get their stats
  let affiliateStats = { activeCount: 0, revenue: 0 };
  if (referralCode) {
    const { count } = await supabase
      .from("cafes")
      .select("*", { count: 'exact', head: true })
      .eq("affiliate_id", user.id);
    
    affiliateStats.activeCount = count || 0;
  }
  
  // ----------------------------------------------------------------------
  // VIEW FOR CUSTOMERS (and Pending Partners)
  // ----------------------------------------------------------------------
  if (!isApprovedPartner) {
    // 2. Fetch Loyalty Cards
    const { data: cards } = await supabase
      .from("loyalty_cards")
      .select(`
        *,
        cafes (
          id,
          name,
          slug,
          stamps_required,
          logo_url
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    // 3. Fetch Promotions (Only if consented)
    let promotions = [];
    if (profile?.marketing_consent) {
        // ideally we filter by cafes the user follows, but for now global or joined-cafes
        const { data: promos } = await supabase
            .from("promotions")
            .select(`
                *,
                cafes (name, logo_url)
            `)
            .order("created_at", { ascending: false })
            .limit(5);
        promotions = promos || [];
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 pb-20 relative">
        
          {/* Subtle Banner Top */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-4 py-2 text-center font-medium">
             Love hmmLoyalty? <Link href="mailto:partners@hmmloyalty.com" className="underline hover:text-indigo-100">Become a Partner</Link> and earn 20% commission on referrals.
          </div>
  
          <header className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 hidden md:block">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-indigo-500/20 shadow-lg">
                        {profile?.full_name ? profile.full_name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none">Hello, {profile?.full_name?.split(' ')[0] || "Guest"}!</h1>
                        <p className="text-xs text-zinc-500 mt-1">Ready for coffee?</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Show Create Cafe button for admins even in customer view */}
                    {(isAdmin || isApprovedPartner) && (
                        <Link href="/dashboard/new" className="text-zinc-500 hover:text-indigo-600 transition-colors" title="Create New Cafe">
                            <Plus size={20} />
                        </Link>
                    )}
                    {isAdmin && (
                        <Link 
                            href="/admin" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-md shadow-indigo-500/20"
                        >
                            <ShieldUser size={14} /> Admin
                        </Link>
                    )}
                    <Link href="/dashboard/settings" className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Settings">
                        <Settings size={20} />
                    </Link>
                    <form action={async () => {
                        "use server";
                        const cookieStore = await cookies();
                        const supabase = createClient(cookieStore);
                        await supabase.auth.signOut();
                        redirect("/login");
                    }}>
                        <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors" title="Sign Out">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-6 pb-2 relative z-50">
             <h1 className="text-2xl font-bold">My Cards</h1>
             <div className="flex gap-4 items-center">
                {(isAdmin || isApprovedPartner) && (
                    <Link href="/dashboard/new" className="text-zinc-400 hover:text-black dark:hover:text-white">
                        <Plus size={20} />
                    </Link>
                )}
                <Link href="/dashboard/settings">
                    <Settings className="text-zinc-400" size={20} />
                </Link>
                {isAdmin && <Link href="/admin"><Shield className="text-indigo-500" size={20} /></Link>}
                <form action={async () => {
                        "use server";
                        const cookieStore = await cookies();
                        const supabase = createClient(cookieStore);
                        await supabase.auth.signOut();
                        redirect("/login");
                    }}>
                    <button><LogOut className="text-zinc-400" /></button>
                </form>
             </div>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-6 md:py-8 space-y-12">
            
            {/* Pending Partner Notice */}
            {['owner', 'cafe_owner'].includes(profile?.requested_role) && !profile?.is_partner && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-800/40 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                        <Coffee size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Partner Account Pending</h3>
                        <p className="text-amber-700/80 dark:text-amber-400/80 text-xs mt-1">
                            Your request to become a cafe owner is under review. You can still use the app as a customer in the meantime!
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-6 py-8">
                
                {/* Affiliate Status Banner - Rendered if they have a code */}
                {referralCode && (
                  <div className="mb-10 bg-gradient-to-br from-indigo-900 via-zinc-900 to-black rounded-2xl p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="text-emerald-400" /> Your Partner Program
                        </h2>
                        <p className="text-zinc-400 text-sm max-w-md mb-4">
                          Share your code with cafe owners. When they sign up, they are linked to you forever, and you earn 20% on their active subscription.
                        </p>
                        <div className="inline-flex items-center gap-3 bg-black/50 border border-zinc-800 rounded-lg px-4 py-2">
                          <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Share Code:</span>
                          <span className="font-mono text-xl font-bold text-white tracking-widest">{referralCode.code}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[120px]">
                          <p className="text-sm font-medium text-zinc-400 mb-1">Total Uses</p>
                          <p className="text-3xl font-bold text-white">{referralCode.usage_count || 0}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[120px]">
                          <p className="text-sm font-medium text-zinc-400 mb-1">Active Cafes</p>
                          <p className="text-3xl font-bold text-emerald-400">{affiliateStats.activeCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loyalty Cards Section */}
                <div className="flex items-center justify-between mb-6 hidden md:flex">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Coffee className="text-indigo-500" /> 
                        Your Cards
                    </h2>
                     <Link href="/" className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                        Scan Code
                    </Link>
                </div>

                {cards && cards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {cards.map((card: any) => {
                             const progress = (card.stamp_count / card.cafes.stamps_required) * 100;
                             return (
                                <Link key={card.id} href={`/c/${card.cafes.slug}`} className="group block">
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg group-hover:text-indigo-500 transition-colors">{card.cafes.name}</h3>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mt-1">Loyalty Member</p>
                                            </div>
                                            {card.cafes.logo_url ? (
                                                <img src={card.cafes.logo_url} alt="" className="w-10 h-10 rounded-full object-cover bg-zinc-100 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {card.cafes.name[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-500">Progress</span>
                                                <span className="font-mono">{card.stamp_count} / {card.cafes.stamps_required}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                >
                                                     <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                             );
                        })}
                         {/* Scan New Card - Mobile friendly card */}
                         <Link href="/" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-indigo-500 transition-colors cursor-pointer group min-h-[160px]">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                                <QrCode size={24} />
                            </div>
                            <p className="text-sm font-bold text-center">Scan QR Code</p>
                            <p className="text-xs text-zinc-500 mt-1">to add a new card</p>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                         <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                            <Search size={32} />
                        </div>
                        <h3 className="font-bold text-xl mb-2">No loyalty cards yet</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                            It looks like you haven't joined any loyalty programs yet. 
                            Visit a participating cafe and scan their QR code to get started!
                        </p>
                    </div>
                )}
            </div>

             {/* --- Promotions Section --- */}
             {promotions.length > 0 && (
                <section className="animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-2 mb-6">
                         <Megaphone className="text-amber-500" />
                         <h2 className="text-xl font-bold">Latest Offers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promotions.map((promo: any) => (
                            <div key={promo.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-200 transition-colors">
                                <div className="flex items-start gap-4 relative z-10">
                                     <div className="w-10 h-10 rounded-full bg-white dark:bg-black/40 flex items-center justify-center text-lg shadow-sm border border-amber-100 dark:border-amber-800/50 flex-shrink-0">
                                        🎁
                                    </div>
                                    <div>
                                        <div className="flex items-baseline justify-between mb-1 gap-2">
                                            <h3 className="font-bold text-amber-900 dark:text-amber-100 leading-tight">{promo.title}</h3>
                                            <span className="text-[10px] uppercase font-bold text-amber-700/50 dark:text-amber-500/50 tracking-wider flex-shrink-0">
                                                {new Date(promo.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-amber-800/80 dark:text-amber-200/80 leading-relaxed mb-3">
                                            {promo.body}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-500">
                                            {promo.cafes.logo_url && <img src={promo.cafes.logo_url} className="w-4 h-4 rounded-full" />}
                                            <span>{promo.cafes.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
             )}

             {/* Join Partner Program Section - Always visible for customers */}
             {!profile?.is_partner && (
                <div className="max-w-md mx-auto py-8 text-center px-4">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">Want to own a loyalty app?</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Start your own digital loyalty business or refer cafes to earn recurring revenue.</p>
                    <Link 
                        href="mailto:partners@hmmloyalty.com"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold hover:shadow-lg hover:scale-105 transition-all w-full"
                    >
                        Join Partner Program <Users className="ml-2 w-4 h-4" />
                    </Link>
                </div>
             )}

             {/* Encourage Sign Up for Partner Program - For users who scroll to the bottom */}
             <div className="pt-8">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">Want to earn with hmmLoyalty?</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs mx-auto">
                Join our Affiliate Program. Refer cafe owners and earn 20% recurring commission on their subscription.
            </p>
            <Link 
                href="mailto:partners@hmmloyalty.com?subject=Affiliate%20Program"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm w-full max-w-xs text-sm"
            >
                <Users className="w-4 h-4" /> Become a Partner
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW FOR PARTNERS (Approved Cafe Owners)
  // ----------------------------------------------------------------------
  const { data: cafes, error: cafesError } = await supabase
    .from("cafes")
    .select("*, loyalty_cards(count)") // Removed stamp_logs(count) as it has no direct relation
    .eq("owner_id", user.id);
  
  if (cafesError) {
    console.error("Error fetching cafes:", cafesError);
  }
  
  return (
    <div className="min-h-screen bg-black p-8 font-sans text-zinc-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
                 <h1 className="text-3xl font-bold">Partner Dashboard</h1>
                 <p className="text-zinc-500 mt-2">Manage your locations and customers</p>
            </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Link href="/dashboard/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/20">
              <Plus size={16} />
              <span className="hidden sm:inline">New Cafe</span>
            </Link>
            <form action={async () => {
              "use server";
              const cookieStore = await cookies();
              const supabase = createClient(cookieStore);
              await supabase.auth.signOut();
              redirect("/login");
            }}>
                <button className="px-4 py-2 bg-zinc-900 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg text-sm font-medium transition-colors">
                  <LogOut size={16} />
                </button>
            </form>
          </div>
        </div>

        {/* Affiliate Status Banner - Rendered if partner is also an affiliate */}
        {referralCode && (
          <div className="mb-12 bg-gradient-to-br from-indigo-900/40 to-zinc-900/40 border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" /> Partner Program Link
                </h2>
                <div className="inline-flex items-center gap-3 mt-2">
                  <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Share Code:</span>
                  <span className="font-mono text-lg font-bold text-white tracking-widest bg-black px-3 py-1 rounded-lg border border-zinc-800">{referralCode.code}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Uses</p>
                  <p className="text-2xl font-bold text-white">{referralCode.usage_count || 0}</p>
                </div>
                <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-bold text-emerald-400">{affiliateStats.activeCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Cafes List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cafes?.map((cafe: any) => {
                     // Counts might come back as array or object depending on adapter, handling array
                     const memberCount = Array.isArray(cafe.loyalty_cards) ? cafe.loyalty_cards[0]?.count : (cafe.loyalty_cards?.count || 0);
                     const activityCount = Array.isArray(cafe.stamp_logs) ? cafe.stamp_logs[0]?.count : (cafe.stamp_logs?.count || 0);

                    return (
                        <Link key={cafe.id} href={`/dashboard/cafe/${cafe.slug}`} className="group relative block bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-900/10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    {cafe.logo_url ? (
                                        <img src={cafe.logo_url} className="w-16 h-16 rounded-full border border-zinc-800 object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-indigo-900/20 group-hover:text-indigo-400 transition-colors">
                                            <Coffee size={28} />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{cafe.name}</h2>
                                        <p className="text-sm text-zinc-500 mt-1">{cafe.address || "No address set"}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {memberCount || 0}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Members</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {activityCount || 0}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">All Time</div>
                                </div>
                                <div className="flex justify-end items-end">
                                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                        Manage <TrendingUp size={12} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {/* Empty State for Partners */}
                {(!cafes || cafes.length === 0) && (
                     <Link href="/dashboard/new" className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center group transition-colors min-h-[220px]">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Plus size={32} />
                        </div>
                        <h3 className="font-bold text-white mb-1">Create your first cafe</h3>
                        <p className="text-sm text-zinc-500">Set up your loyalty program in seconds</p>
                     </Link>
                )}
            </div>
          </div>

          {/* Sidebar - Quick Stats & Actions */}
          <div className="hidden lg:block bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Total Cafes</span>
                    <span className="text-white">{cafes?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Total Members</span>
                    <span className="text-white">{cafes?.reduce((acc: number, cafe: any) => acc + (Array.isArray(cafe.loyalty_cards) ? cafe.loyalty_cards[0]?.count : (cafe.loyalty_cards?.count || 0)), 0) || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">All Time Activity</span>
                    <span className="text-white">{cafes?.reduce((acc: number, cafe: any) => acc + (Array.isArray(cafe.stamp_logs) ? cafe.stamp_logs[0]?.count : (cafe.stamp_logs?.count || 0)), 0) || 0}</span>
                </div>
            </div>

            <div className="mt-6">
                <Link href="/dashboard/new" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors">
                    + Add New Cafe
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
