import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCodeGenerator } from "./qr-generator";
import { Users, Award, ShieldCheck, Link as LinkIcon, Gift, Activity, Image as ImageIcon, Megaphone, Settings, TrendingUp, Coffee as CoffeeIcon, Shield } from "lucide-react";
import { LogoUpload } from "./logo-upload";
import { CampaignForm } from "./campaign-form";
import { CafeSettingsForm } from "./settings-form";
import { BusinessFlowChart } from "./flow-chart";
import { FeatureLock } from "@/components/feature-lock";
import { isFeatureEnabled, FEATURES, PlanLevel } from "@/utils/features";

// Force dynamic rendering to prevent Vercel from trying to statically generate this authenticated page
export const dynamic = "force-dynamic";

// ⚠️ Load from environment variable for security
const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
  : [];

export default async function CafeManagementPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Safely check for user session with error handling
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect("/login");
  }

  const userEmail = user.email ? user.email.toLowerCase() : "";
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  // Initialize query
  let query = supabase
    .from("cafes")
    .select("*")
    .eq("slug", resolvedParams.slug);

  // If not admin, enforce ownership
  if (!isAdmin) {
    query = query.eq("owner_id", user.id);
  }

  const { data: cafe, error: cafeError } = await query.single();

  if (cafeError || !cafe) {
    // If cafe doesn't exist or isn't owned by user, go back to dashboard
    return redirect("/dashboard");
  }

  // Determine user's plan - default to 'standard' if missing
  const plan: PlanLevel = (cafe.plan_level as PlanLevel) || 'standard'; 

  // Fetch secret PIN - owner only
  const { data: secret } = await supabase
    .from("cafe_secrets")
    .select("pin_code")
    .eq("cafe_id", cafe.id)
    .single();

  const cafeWithSecret = {
    ...cafe,
    pin_code: secret?.pin_code || cafe.pin_code || "0000",
  };

  // Init Admin Client for Analytics (Bypasses RLS to ensure accurate stats)
  let analyticsClient: any = supabase;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    analyticsClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }

  // Basic analytics: How many cards exist
  // Use analyticsClient to bypass RLS and ensure we get ALL cards associated with this cafe
  const { count: totalCustomers } = await analyticsClient
    .from("loyalty_cards")
    .select("*", { count: "exact", head: true })
    .eq("cafe_id", cafe.id);

  // Fetch all card IDs using admin permissions so our log queries contain complete data
  const { data: cards } = await analyticsClient
    .from("loyalty_cards")
    .select("id, stamp_count, user_id")
    .eq("cafe_id", cafe.id);

  // Let's get card IDs to fetch recent activity
  const cardIds = cards?.map((c: any) => c.id).filter(Boolean) || [];
  const userIds = cards?.map((c: any) => c.user_id).filter(Boolean) || [];

  // 1. Calculate Real Total Stamps (Count logs instead of current card value)
  const { count: totalStampsReal } = cardIds.length > 0 ? await analyticsClient
    .from("stamp_logs")
    .select("*", { count: "exact", head: true })
    .in("card_id", cardIds) : { count: 0 };

  // 2. Calculate Real Rewards Redeemed (Count logs with redemption note)
  // Use case-sensitive match or just "Reward Redeemed" if consistent
  const { count: totalRedeemedReal } = cardIds.length > 0 ? await analyticsClient
    .from("stamp_logs")
    .select("*", { count: "exact", head: true })
    .in("card_id", cardIds)
    .ilike("notes", "%redeemed%") : { count: 0 };

  // Fetch all stamp logs from the last 30 days for flow analytics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: logs } = cardIds.length > 0 ? await analyticsClient
    .from("stamp_logs")
    .select(`created_at, notes`)
    .in("card_id", cardIds)
    .gte("created_at", thirtyDaysAgo.toISOString()) : { data: [] };

  // Calculate Daily Flow (Last 30 Days)
  const dailyFlow: Record<string, number> = {};
  
  // Initialize with 0s
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Use ISO date string (YYYY-MM-DD) as key for sorting
    const key = d.toISOString().split('T')[0];
    dailyFlow[key] = 0;
  }
  
  logs?.forEach((log: any) => {
    const key = new Date(log.created_at).toISOString().split('T')[0];
    if (dailyFlow[key] !== undefined) {
      dailyFlow[key]++;
    }
  });

  const dailyFlowArray = Object.entries(dailyFlow)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateStr, count]) => {
        const date = new Date(dateStr);
        return [
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count
        ] as [string, number];
    });

  const currentMonthCount = logs?.length || 0;

  // Fetch recent activity logs
  const { data: recentLogs } = cardIds.length > 0 ? await analyticsClient
    .from("stamp_logs")
    .select(`
      created_at,
      loyalty_cards:card_id (
        profiles:user_id ( full_name )
      )
    `)
    .in("card_id", cardIds)
    .order("created_at", { ascending: false })
    .limit(5) : { data: [] };

  // Fetch marketing opt-ins (User profile data usually accessible to owner via query, or default to 0)
  const { count: optedInCount } = userIds.length > 0 ? await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("id", userIds)
    .eq("marketing_consent", true) : { count: 0 };

  // Compute full customer URL dynamically based on request headers
  // This ensures the QR code works on localhost, Vercel previews, and production without config
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") === "http" ? "http" : "https";
  
  // Strip trailing slashes just in case
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`).replace(/\/$/, "");

  const publicUrl = `${baseUrl}/c/${cafe.slug}`;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black w-full p-8 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center mb-8 gap-4">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white">
            &larr; Back to Dashboard
          </Link>
          
          {/* Secret Admin Button */}
          {isAdmin && (
             <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-1 text-xs font-bold border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-full transition-colors">
                <Shield size={12} />
                Super Admin
             </Link>
          )}

          <h1 className="text-3xl font-bold dark:text-white">{cafe.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats and Analytics - Takes up 2 columns on lg screens */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-zinc-400" />
                <h2 className="text-xl font-bold dark:text-white tracking-tight">Analytics Dashboard</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
                    <Users size={18} />
                    <p className="text-sm font-medium">Total Customers</p>
                  </div>
                  <p className="text-4xl font-black text-black dark:text-white">{totalCustomers || 0}</p>
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
                    <Award size={18} />
                    <p className="text-sm font-medium">Stamps Issued</p>
                  </div>
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{totalStampsReal || 0}</p>
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-green-100 dark:hover:border-green-900/30 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
                    <CoffeeIcon size={18} />
                    <p className="text-sm font-medium">Coffees Given</p>
                  </div>
                  <p className="text-4xl font-black text-green-600 dark:text-green-500">{totalRedeemedReal || 0}</p>
                </div>
              </div>

              {/* Monthly Flow Analysis */}
              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-indigo-500" />
                    <h3 className="font-bold text-zinc-900 dark:text-white">Business Flow (Last 30 Days)</h3>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    {currentMonthCount} Scans This Month
                  </span>
                </div>
                
                {/* Modern Recharts Component */}
                <BusinessFlowChart 
                  data={dailyFlowArray.map(([day, count]) => ({ day, count }))} 
                />
                
                <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <strong className="text-zinc-900 dark:text-zinc-200">Analysis: </strong>
                  {currentMonthCount > 100 
                    ? "Fantastic engagement! Your program is a core part of your customers' routine."
                    : currentMonthCount > 20 
                      ? "Steady flow. Try running a 'Double Stamp' promotion to boost these numbers."
                      : "Things are just getting started. Focus on signing up every customer at the register!"}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="text-zinc-400" />
                  <h3 className="font-bold text-zinc-900 dark:text-white">Cafe Configuration</h3>
                </div>
                <CafeSettingsForm cafe={cafeWithSecret} />
              </div>
            </div>

            {/* Brand Settings */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="text-zinc-400" />
                <h2 className="text-xl font-bold dark:text-white tracking-tight">Brand Settings</h2>
              </div>
              <LogoUpload cafeId={cafe.id} currentLogo={cafe.logo_url} />
            </div>

            {/* Marketing block */}
            <div className="relative">
              {!isFeatureEnabled(plan, FEATURES.PROMOTIONS) && (
                <div className="absolute inset-x-0 w-full z-10 px-6">
                    <FeatureLock 
                        isLocked={true} 
                        title="Growth Feature: Promotions"
                        description="Upgrade to the Growth plan to send marketing campaigns."
                    >
                         {/* Empty child just for the lock UI structure */}
                         <div className="h-[200px]" />
                    </FeatureLock>
                </div>
              )}
              
              <div className={`${!isFeatureEnabled(plan, FEATURES.PROMOTIONS) ? "opacity-20 blur-sm pointer-events-none filter grayscale" : ""} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-500`}>
                <div className="flex items-center gap-3 mb-6">
                    <Megaphone className="text-zinc-400" />
                    <h2 className="text-xl font-bold dark:text-white tracking-tight">Audience & Marketing</h2>
                </div>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                    Connect with customers who have opted-in to receive promotional materials when they scanned your QR code.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-6 rounded-2xl flex-1 text-center group transition-colors hover:border-indigo-200">
                    <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{optedInCount || 0}</p>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Opted-In Customers</p>
                    </div>
                    <CampaignForm cafeId={cafe.id} audienceCount={optedInCount || 0} />
                </div>
              </div>
            </div>

            {/* Staff Management (Feature Placeholders) */}
            <div className="relative">
                {!isFeatureEnabled(plan, FEATURES.STAFF_MANAGEMENT) && (
                     <div className="absolute inset-x-0 w-full z-10 px-6">
                        <FeatureLock 
                            isLocked={true} 
                            title="Pro Feature: Staff Management"
                            description="Upgrade to the Pro plan to add staff accounts and manage permissions."
                        >
                            <div className="h-[200px]" />
                        </FeatureLock>
                    </div>
                )}
                 <div className={`${!isFeatureEnabled(plan, FEATURES.STAFF_MANAGEMENT) ? "opacity-20 blur-sm pointer-events-none filter grayscale" : ""} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-500`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="text-zinc-400" />
                        <h2 className="text-xl font-bold dark:text-white tracking-tight">Staff Accounts</h2>
                    </div>
                    <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                        Add staff members to verify stamps without sharing the master PIN.
                    </p>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <p className="text-zinc-400 text-sm">No staff accounts created yet.</p>
                        <button className="mt-4 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Add New Staff
                        </button>
                    </div>
                 </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Activity
              </h3>
              
              {recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <Award size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-sm dark:text-white">
                            {log.loyalty_cards?.profiles?.full_name || "A customer"}
                          </p>
                          <p className="text-xs text-zinc-500">Collected a stamp</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-zinc-400">
                        {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <Activity className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scanning activity yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketing & QR Code - Sidebar on lg screens */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Counter Code</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              Print this code for your counter, or encode it into an NFC tag using a free app like NFC Tools.
            </p>

            <div className="bg-white p-5 rounded-3xl shadow-md border border-zinc-100 mb-8 max-w-[200px] w-full aspect-square flex items-center justify-center">
               <QrCodeGenerator url={publicUrl} />
            </div>

            {isFeatureEnabled(plan, FEATURES.STAFF_MANAGEMENT) && (
              <div className="w-full mb-8">
                 <Link 
                   href={`/dashboard/cafe/${cafe.slug}/pos`}
                   className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                 >
                   <ShieldCheck size={18} />
                   Launch POS Terminal
                 </Link>
                 <p className="text-[10px] text-zinc-500 mt-2 text-center">
                   Open this on your counter tablet for secure, dynamic QR codes.
                 </p>
              </div>
            )}

            <div className="w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                <LinkIcon size={12} />
                <span>Direct Link</span>
              </div>
              <div className="flex w-full group">
                <input 
                  type="text" 
                  readOnly 
                  value={publicUrl}
                  className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-l-xl px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 outline-none w-0 overflow-hidden text-ellipsis whitespace-nowrap focus:border-indigo-500 transition-colors"
                />
                <a 
                  href={publicUrl}
                  target="_blank"
                  className="bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-r-xl text-sm font-bold flex items-center justify-center hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}