import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QrCodeGenerator } from "./qr-generator";
import { Users, Award, ShieldCheck, Link as LinkIcon, Gift, Activity, Image as ImageIcon, Megaphone, Settings, TrendingUp, Coffee as CoffeeIcon } from "lucide-react";
import { LogoUpload } from "./logo-upload";
import { CampaignForm } from "./campaign-form";
import { CafeSettingsForm } from "./settings-form";

export default async function CafeManagementPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Fetch the specific cafe
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .eq("owner_id", user.id)
    .single();

  if (!cafe) return redirect("/dashboard");

  // Basic analytics: How many cards exist and total stamps given
  const { count: totalCustomers } = await supabase
    .from("loyalty_cards")
    .select("*", { count: "exact", head: true })
    .eq("cafe_id", cafe.id);

  const { data: cards } = await supabase
    .from("loyalty_cards")
    .select("id, stamp_count, user_id")
    .eq("cafe_id", cafe.id);

  const totalStampsEver = cards?.reduce((acc, curr) => acc + curr.stamp_count, 0) || 0;

  // Calculate how many customers are ready for rewards
  const completedCardsCount = cards?.filter(card => card.stamp_count >= cafe.stamps_required).length || 0;

  // Let's get card IDs to fetch recent activity
  const cardIds = cards?.map((c: any) => c.id).filter(Boolean) || [];
  const userIds = cards?.map((c: any) => c.user_id).filter(Boolean) || [];

  // Fetch all stamp logs from the last 7 days for flow analytics
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: weeklyLogs } = cardIds.length > 0 ? await supabase
    .from("stamp_logs")
    .select(`created_at`)
    .in("card_id", cardIds)
    .gte("created_at", sevenDaysAgo.toISOString()) : { data: [] };

  // Calculate Daily Flow
  const dailyFlow: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyFlow[d.toLocaleDateString(undefined, { weekday: 'short' })] = 0;
  }
  
  weeklyLogs?.forEach(log => {
    const day = new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short' });
    if (dailyFlow[day] !== undefined) {
      dailyFlow[day]++;
    }
  });

  const dailyFlowArray = Object.entries(dailyFlow).reverse();
  const currentWeekCount = weeklyLogs?.length || 0;

  // Fetch recent activity logs
  const { data: recentLogs } = cardIds.length > 0 ? await supabase
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

  // Fetch marketing opt-ins
  const { count: optedInCount } = userIds.length > 0 ? await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("id", userIds)
    .eq("marketing_consent", true) : { count: 0 };

  // Compute full customer URL
  // Priority: 1. Manual SITE_URL 2. Automatic Vercel URL 3. Localhost fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const publicUrl = `${baseUrl}/c/${cafe.slug}`;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black w-full p-8 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center mb-8 gap-4">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white">
            &larr; Back to Dashboard
          </Link>
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
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{totalStampsEver}</p>
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-green-100 dark:hover:border-green-900/30 transition-colors">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
                    <CoffeeIcon size={18} />
                    <p className="text-sm font-medium">Coffees Given</p>
                  </div>
                  <p className="text-4xl font-black text-green-600 dark:text-green-500">{cafe.total_rewards_redeemed || 0}</p>
                </div>
              </div>

              {/* Weekly Flow Analysis */}
              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-indigo-500" />
                    <h3 className="font-bold text-zinc-900 dark:text-white">Business Flow (Last 7 Days)</h3>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    {currentWeekCount} Scans This Week
                  </span>
                </div>
                
                <div className="flex items-end gap-2 h-32 mt-4">
                  {dailyFlowArray.map(([day, count], index) => {
                    // Simple relative height calc
                    const maxCount = Math.max(...dailyFlowArray.map(arr => arr[1]), 1);
                    const heightPercent = Math.max((count / maxCount) * 100, 5); // 5% minimum bar height
                    return (
                      <div key={day} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                        <span className="text-xs font-bold text-transparent group-hover:text-zinc-400 transition-colors">
                          {count}
                        </span>
                        <div 
                          className="w-full bg-indigo-500/20 hover:bg-indigo-500 rounded-t-lg transition-all duration-300 relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {index === 6 && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        <span className="text-xs font-medium text-zinc-500">{day}</span>
                      </div>
                    );
                  })}
                </div>
                
                <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                  <strong className="text-zinc-900 dark:text-zinc-200">Analysis: </strong>
                  {currentWeekCount > 20 
                    ? "Great foot traffic this week! Your loyalty program is actively driving engagement. Consider sending a marketing blast to convert more regular visits."
                    : currentWeekCount > 5 
                      ? "Steady flow of customers. Remind your baristas to encourage customers to scan their digital loyalty cards at checkout."
                      : "Traffic is a bit quiet. You could offer an immediate 'double stamps' day to encourage adoption and get more people carrying your card in their wallet."}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="text-zinc-400" />
                  <h3 className="font-bold text-zinc-900 dark:text-white">Cafe Configuration</h3>
                </div>
                <CafeSettingsForm cafe={cafe} />
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
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
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