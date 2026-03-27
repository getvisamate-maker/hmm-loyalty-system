import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  Shield, 
  Users, 
  Coffee, 
  Activity, 
  Store, 
  AlertCircle,
  Check,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import { CafeStatusToggle, ApprovePartnerButton, DeleteCafeButton, DeleteUserButton, PlanSelector, CreateReferralCodeForm } from "./client-components"; // Added CreateReferralCodeForm import
import Link from "next/link";

// ⚠️ TODO: Replace with your actual User ID if you want ID-based access
const SUPER_ADMIN_ID = "replace-with-your-uuid"; 
const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
  : [];

export const dynamic = "force-dynamic";

export default async function AdminDashboard(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await props.searchParams;
  const currentTab = resolvedSearchParams.tab || "overview";
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log("Admin Dashboard: Checking Auth...");

  // 1. Verify Authentication & Role
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Check Profile Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userEmail = user.email ? user.email.toLowerCase() : "";
  console.log("Current User:", userEmail, "| Admin List:", ADMIN_EMAILS);

  const isSuperAdmin = 
    profile?.role === "super_admin" || 
    user.id === SUPER_ADMIN_ID || 
    (userEmail && ADMIN_EMAILS.includes(userEmail));

  if (!isSuperAdmin) {
    console.warn("Unauthorized admin access attempt:", user.id, userEmail);
    return redirect("/dashboard");
  }

  // 2. Initialize Admin Client
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-red-500 font-bold">
        Error: SUPABASE_SERVICE_ROLE_KEY is missing.
      </div>
    );
  }

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // 3. Fetch Data in Parallel
  const [
    cafesRes, 
    cafesNewRes,
    usersCountRes, 
    usersNewRes,
    stampsCountRes, 
    stampsNewRes,
    activityRes, 
    partnersRes
  ] = await Promise.all([
    adminDb.from("cafes").select("*", { count: "exact" }).order("created_at", { ascending: false }),
    adminDb.from("cafes").select("*", { count: "exact", head: true }).gt("created_at", sevenDaysAgoISO),
    adminDb.from("profiles").select("*", { count: "exact" }),
    adminDb.from("profiles").select("*", { count: "exact", head: true }).gt("created_at", sevenDaysAgoISO),
    adminDb.from("stamp_logs").select("*", { count: "exact", head: true }),
    adminDb.from("stamp_logs").select("*", { count: "exact", head: true }).gt("created_at", sevenDaysAgoISO),
    // Fix: Proper relations (supabase infers via foreign keys, naming convention is table name)
    adminDb
      .from("stamp_logs")
      .select(`
        created_at,
        card_id,
        notes,
        loyalty_cards (
            user:profiles ( full_name, email ),
            cafe:cafes ( name )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(15),
    adminDb
      .from("profiles")
      .select("*")
      // Only fetch those who actually requested to be an owner (or cafe_owner legacy)
      .in("requested_role", ["owner", "cafe_owner"])
  ]);

  // Affiliate Stats Fetch
  const [affiliatesRaw, allAffiliatedCafes] = await Promise.all([
    adminDb.from("referral_codes").select("*, referrer:profiles(full_name, email)"),
    adminDb.from("cafes").select("id, status, plan_level, affiliate_id").not("affiliate_id", "is", null)
  ]);

  const affiliatesList = affiliatesRaw.data || [];
  const affiliatedCafes = allAffiliatedCafes.data || [];

  // Calculate Revenue Metrics per Affiliate
  const affiliateMetrics = affiliatesList.map((a: any) => {
    // Find cafes attributed to this affiliate
    const theirCafes = affiliatedCafes.filter((c: any) => c.affiliate_id === a.referrer_id);
    const activeCafes = theirCafes.filter((c: any) => c.status === 'active');
    
    let monthlyRevenue = 0;
    
    activeCafes.forEach((c: any) => {
      // Dummy Pricing Model
      if (c.plan_level === 'pro') monthlyRevenue += 299;
      else if (c.plan_level === 'growth') monthlyRevenue += 149;
      else monthlyRevenue += 49; // Standard
    });

    const revenueShare = monthlyRevenue * 0.20; // 20%
    
    return {
      ...a,
      active_count: activeCafes.length,
      monthly_revenue: monthlyRevenue,
      revenue_share: revenueShare
    };
  });

  const cafes = cafesRes.data || [];
  const totalCafes = cafesRes.count || 0;
  const newCafes = cafesNewRes.count || 0;

  const users = usersCountRes.data || [];
  const totalUsers = usersCountRes.count || 0;
  const newUsers = usersNewRes.count || 0;

  const totalStamps = stampsCountRes.count || 0;
  const newStamps = stampsNewRes.count || 0;

  const activities = activityRes.data || [];
  const pendingPartners = partnersRes.data || [];

  // Calculate MRR
  let mrr = 0;
  cafes.forEach((c: any) => {
    if(c.status === 'active') {
      if (c.plan_level === 'pro') mrr += 299;
      else if (c.plan_level === 'growth') mrr += 149;
      else mrr += 49;
    }
  });

  // Calculate System Latency
  const pingStart = Date.now();
  await adminDb.from('profiles').select('id').limit(1);
  const pingTime = Date.now() - pingStart;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               <Shield className="text-indigo-400 w-5 h-5" />
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">Command Center</h1>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-mono">hmmLoyalty Super Admin</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
             <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800" title="Database ping latency">
                <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${pingTime < 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {pingTime}ms
             </span>
             <span className="hidden sm:inline-block">{user.email}</span>
             
             <div className="flex items-center gap-3 md:ml-2 md:border-l border-zinc-800 md:pl-4">
                <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md">
                    <ArrowLeft size={14} /> Home
                </Link>
                <form action="/auth/signout" method="post">
                    <button type="submit" className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 px-3 py-1.5 rounded-md border border-transparent">
                    <LogOut size={14} />
                    </button>
                </form>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto no-scrollbar border-t border-zinc-900">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'cafes', label: 'Cafes', icon: Store },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'affiliates', label: 'Affiliates', icon: TrendingUp },
            ].map(tab => (
              <Link 
                key={tab.id} 
                href={`?tab=${tab.id}`}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${currentTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                 {tab.id === 'overview' && pendingPartners.length > 0 && (
                   <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingPartners.length}</span>
                 )}
              </Link>
            ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {currentTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                     title="Monthly Recurring" 
                     value={`$${mrr}`} 
                     icon={<TrendingUp className="text-emerald-400" size={20} />} 
                     trend="Estimated ARR: $" 
                     trendValue={mrr * 12}
                  />
                  <StatCard 
                     title="Total Cafes" 
                     value={totalCafes} 
                     icon={<Store className="text-zinc-400" size={20} />} 
                     trend={`+${newCafes} this week`}
                  />
                  <StatCard 
                     title="Total Users" 
                     value={totalUsers} 
                     icon={<Users className="text-zinc-400" size={20} />} 
                     trend={`+${newUsers} this week`}
                  />
                  <StatCard 
                     title="Stamps Issued" 
                     value={totalStamps} 
                     icon={<Coffee className="text-zinc-400" size={20} />} 
                     trend={`+${newStamps} this week`}
                  />
                </section>

                {/* Recent Activity Feed */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                   <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                      <h2 className="font-bold text-zinc-200 flex items-center gap-2">
                         <Activity size={18} className="text-emerald-400" />
                         Live Feed
                      </h2>
                      <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tracking
                      </span>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-zinc-400">
                       <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                         <tr>
                           <th className="px-6 py-3 font-medium">User</th>
                           <th className="px-6 py-3 font-medium">Action</th>
                           <th className="px-6 py-3 font-medium">Cafe</th>
                           <th className="px-6 py-3 font-medium text-right">Time</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-800">
                         {activities.map((log: any, i: number) => {
                           const userName = log.card?.user?.full_name || log.card?.user?.email || "Unknown User";
                           const cafeName = log.card?.cafe?.name || "Unknown Cafe";
                           return (
                            <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{userName}</td>
                              <td className="px-6 py-4 flex items-center gap-2 text-indigo-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Stamp Added
                              </td>
                              <td className="px-6 py-4">{cafeName}</td>
                              <td className="px-6 py-4 text-right font-mono text-xs text-zinc-500">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                           );
                         })}
                         {activities.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-zinc-600 italic">No recent activity.</td>
                            </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                </section>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-8">
              {/* Partner Requests */}
              <section className="bg-zinc-900/50 border border-amber-900/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl h-fit">
                 <div className="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center">
                    <h2 className="font-bold text-amber-500 flex items-center gap-2">
                       <AlertCircle size={18} />
                       Partner Requests
                    </h2>
                    {pendingPartners.length > 0 && (
                      <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">
                        {pendingPartners.length} New
                      </span>
                    )}
                 </div>
                 
                 <div className="p-4 space-y-4">
                   {pendingPartners.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-zinc-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-600">
                          <Check size={20} />
                        </div>
                        <p className="text-zinc-500 text-sm">All caught up! No pending requests.</p>
                      </div>
                   ) : (
                      pendingPartners.map((partner: any) => (
                        <div key={partner.id} className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 hover:border-amber-500/30 transition-colors">
                          <div className="flex justify-between items-start">
                             <div className="truncate pr-2">
                               <h3 className="font-bold text-white text-sm truncate">{partner.full_name}</h3>
                               <p className="text-zinc-500 text-xs mt-0.5 truncate">{partner.email || "No email"}</p>
                             </div>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md flex-shrink-0">
                               {partner.requested_role === 'owner' ? 'Owner' : partner.requested_role}
                             </span>
                          </div>
                          <div className="pt-3 border-t border-zinc-800/50 flex justify-end">
                             <ApprovePartnerButton userId={partner.id} />
                          </div>
                        </div>
                      ))
                   )}
                 </div>
              </section>

               {/* System Status */}
              <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14}/> System Health
                  </h3>
                  <div className="space-y-3">
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-zinc-400">Database</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md text-xs">
                          <Check size={12} /> Connected
                        </span>
                     </div>
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-zinc-400">Storage</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md text-xs">
                          <Check size={12} /> Healthy
                        </span>
                     </div>
                     <div className="flex justify-between text-sm items-center">
                        <span className="text-zinc-400">Admin Payload</span>
                        <span className="text-blue-400 font-bold font-mono bg-blue-500/10 px-2 py-1 rounded-md text-xs">
                           {cafes.length + users.length + affiliateMetrics.length} Rows
                        </span>
                     </div>
                  </div>
              </section>
            </div>
          </div>
        )}

        {currentTab === 'cafes' && (
           <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-800/50 to-transparent">
                <h2 className="font-bold text-zinc-200 flex items-center gap-2 text-lg">
                   <Store className="text-indigo-400" />
                   All Registered Cafes
                </h2>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">{cafes.length} Total</span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-zinc-400">
                 <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                   <tr>
                     <th className="px-6 py-4 font-medium">Cafe Details</th>
                     <th className="px-6 py-4 font-medium">Subscription</th>
                     <th className="px-6 py-4 font-medium">Settings</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/50">
                   {cafes.map((cafe: any) => (
                     <tr key={cafe.id} className="hover:bg-zinc-800/30 transition-all">
                       <td className="px-6 py-4">
                          <p className="font-bold text-white text-base">{cafe.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <a href={`/c/${cafe.slug}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono">
                               /c/{cafe.slug}
                             </a>
                             {cafe.location && <span className="text-xs text-zinc-500 border-l border-zinc-700 pl-2">{cafe.location}</span>}
                          </div>
                          {cafe.affiliate_id && (
                             <span className="inline-block mt-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                               Referred
                             </span>
                          )}
                       </td>
                       <td className="px-6 py-4 align-top">
                          <PlanSelector cafeId={cafe.id} currentPlan={cafe.plan_level || 'standard'} />
                       </td>
                       <td className="px-6 py-4 align-top">
                          <div className="space-y-1">
                             <div className="text-xs"><span className="text-zinc-500">Stamps Reqd:</span> <span className="text-white font-mono">{cafe.stamps_required}</span></div>
                             <div className="text-xs"><span className="text-zinc-500">Owner ID:</span> <span className="text-white font-mono" title={cafe.owner_id}>{cafe.owner_id.substring(0,8)}...</span></div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right align-top">
                         <div className="flex justify-end items-center gap-3">
                            <CafeStatusToggle cafeId={cafe.id} initialStatus={cafe.status || 'active'} />
                            <DeleteCafeButton cafeId={cafe.id} />
                         </div>
                       </td>
                     </tr>
                   ))}
                   {cafes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-lg">No cafes found in the database.</td>
                      </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </section>
        )}

        {currentTab === 'users' && (
           <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-gradient-to-r from-zinc-800/50 to-transparent">
                <h2 className="font-bold text-zinc-200 flex items-center gap-2 text-lg">
                   <Users className="text-blue-400" />
                   User Database
                </h2>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">{users.length} Total</span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-zinc-400">
                 <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                   <tr>
                     <th className="px-6 py-4 font-medium">User Profile</th>
                     <th className="px-6 py-4 font-medium">Security Role</th>
                     <th className="px-6 py-4 font-medium">Timestamps</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/50">
                   {users.map((u: any) => (
                     <tr key={u.id} className="hover:bg-zinc-800/30 transition-all">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 border border-zinc-700">
                                {u.full_name ? u.full_name[0].toUpperCase() : u.email?.[0].toUpperCase() || '?'}
                             </div>
                             <div>
                                <div className="font-bold text-white">{u.full_name || "Anonymous User"}</div>
                                <div className="text-xs text-zinc-500 font-mono mt-0.5">{u.email}</div>
                             </div>
                          </div>
                          {u.marketing_consent && (
                             <span className="inline-block mt-2 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Consented to Marketing</span>
                          )}
                       </td>
                       <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col gap-2 items-start">
                              <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide border shadow-sm ${
                                 u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                 u.role === 'cafe_owner' || u.is_partner ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                                 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}>
                                 {u.role === 'super_admin' ? 'Super Admin' : u.is_partner ? 'Cafe Owner' : u.role || 'Customer'}
                              </span>
                              {u.requested_role && !u.is_partner && u.requested_role !== 'customer' && (
                                <span className="text-[10px] text-amber-500 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded">
                                  Requested: {u.requested_role}
                                </span>
                              )}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-xs text-zinc-500 align-middle">
                          <div><span className="text-zinc-600">Joined:</span> {new Date(u.created_at).toLocaleDateString()}</div>
                          <div className="mt-1 font-mono text-[10px]">{u.id}</div>
                       </td>
                       <td className="px-6 py-4 text-right align-middle">
                          <div className="flex justify-end gap-2">
                            <DeleteUserButton userId={u.id} />
                          </div>
                       </td>
                     </tr>
                   ))}
                   {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-lg">No users found.</td>
                      </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </section>
        )}

        {currentTab === 'affiliates' && (
           <section className="bg-zinc-900/50 border border-emerald-900/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="px-6 py-6 border-b border-zinc-800 bg-gradient-to-r from-emerald-900/20 to-transparent flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <h2 className="font-bold text-emerald-400 flex items-center gap-2 text-xl">
                     <TrendingUp className="text-emerald-500" />
                     Affiliate & Partner Network
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">Manage referral codes and track commission payouts.</p>
                </div>
                
                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/50 min-w-[300px]">
                  <h3 className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Generate New Link</h3>
                  <CreateReferralCodeForm />
                </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-zinc-400">
                 <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-b border-zinc-800">
                   <tr>
                     <th className="px-6 py-4 font-medium">Affiliate Partner</th>
                     <th className="px-6 py-4 font-medium">Referral Code</th>
                     <th className="px-6 py-4 font-medium text-center">Active Referrals</th>
                     <th className="px-6 py-4 font-medium text-right">Generated Revenue</th>
                     <th className="px-6 py-4 font-medium text-right">Owed Commission</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/50">
                   {affiliateMetrics
                      .sort((a: any, b: any) => b.revenue_share - a.revenue_share)
                      .map((aff: any) => (
                     <tr key={aff.id} className="hover:bg-zinc-800/30 transition-all">
                       <td className="px-6 py-4">
                          <div className="font-bold text-white text-base">{aff.referrer?.full_name || "Unknown Identity"}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{aff.referrer?.email || "No email linked"}</div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-700 px-3 py-1.5 rounded-lg group hover:border-emerald-500/50 transition-colors">
                            <span className="font-mono text-emerald-400 font-bold tracking-widest">{aff.code}</span>
                          </div>
                          <div className="text-[10px] text-zinc-600 mt-1">Created: {new Date(aff.created_at).toLocaleDateString()}</div>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-white font-bold border border-zinc-700">
                            {aff.active_count}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="text-lg text-zinc-300">${aff.monthly_revenue.toFixed(2)}</span>
                          <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">/ month</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className="text-xl font-black text-emerald-400">${aff.revenue_share.toFixed(2)}</span>
                          <span className="block text-[10px] text-emerald-500/50 uppercase tracking-widest">20% cut</span>
                       </td>
                     </tr>
                   ))}
                   {affiliateMetrics.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="inline-block bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                            <TrendingUp className="mx-auto text-zinc-600 mb-3" size={32} />
                            <p className="text-white font-medium text-lg mb-1">No affiliates yet</p>
                            <p className="text-zinc-500 text-sm">Generate your first referral link above to start your network.</p>
                          </div>
                        </td>
                      </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendValue }: any) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md shadow-lg hover:border-zinc-700 transition-all group overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-4xl font-black text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-zinc-700 shadow-sm">
           {icon}
        </div>
      </div>
      <div className="flex items-center mt-auto relative z-10">
        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md shadow-sm">
           {trend} {trendValue !== undefined ? trendValue : ''}
        </span>
      </div>
    </div>
  );
}


