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

export default async function AdminDashboard() {
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
      // Remove specific filter for now to just get list if needed, but below uses "requested_role"
      .not("requested_role", "is", null) 
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
               <Shield className="text-indigo-400 w-5 h-5" />
             </div>
             <h1 className="text-lg font-bold tracking-tight text-white">Command Center</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
             <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
             </span>
             <span>{user.email}</span>
             
             <div className="flex items-center gap-3 ml-2 border-l border-zinc-800 pl-4">
                <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1" title="Back to Home">
                    <ArrowLeft size={14} /> Back
                </Link>
                <form action="/auth/signout" method="post">
                    <button type="submit" className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1" title="Sign Out">
                    <LogOut size={14} /> Out
                    </button>
                </form>
             </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Charts */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Stats Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Main Content Area (2 cols) */}
                      <div className="lg:col-span-2 space-y-8">
                        
                        {/* Cafe Management */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                           <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                              <h2 className="font-bold text-zinc-200 flex items-center gap-2">
                                 <Store size={18} className="text-indigo-400" />
                                 Cafe Management
                              </h2>
                              <span className="text-xs font-mono text-zinc-500">{cafes.length} Active</span>
                           </div>
                           
                           <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-zinc-400">
                               <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                                 <tr>
                                   <th className="px-6 py-3 font-medium">Name</th>
                                   <th className="px-6 py-3 font-medium">Location</th>
                                   <th className="px-6 py-3 font-medium">Plan</th>
                                   <th className="px-6 py-3 font-medium">Slug</th>
                                   <th className="px-6 py-3 font-medium text-right">Status / Actions</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-zinc-800">
                                 {cafes.map((cafe: any) => (
                                   <tr key={cafe.id} className="hover:bg-zinc-900/30 transition-colors">
                                     <td className="px-6 py-4 font-medium text-white">{cafe.name}</td>
                                     <td className="px-6 py-4">{cafe.location || "N/A"}</td>
                                     <td className="px-6 py-4">
                                        <PlanSelector cafeId={cafe.id} currentPlan={cafe.plan_level || 'standard'} />
                                     </td>
                                     <td className="px-6 py-4 font-mono text-xs">{cafe.slug}</td>
                                     <td className="px-6 py-4 text-right">
                                       <div className="flex justify-end items-center gap-3">
                                          <CafeStatusToggle cafeId={cafe.id} initialStatus={cafe.status || 'active'} />
                                          <DeleteCafeButton cafeId={cafe.id} />
                                       </div>
                                     </td>
                                   </tr>
                                 ))}
                                 {cafes.length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-600 italic">No cafes found.</td>
                                    </tr>
                                 )}
                               </tbody>
                             </table>
                           </div>
                        </section>

                        {/* User Management */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                           <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                              <h2 className="font-bold text-zinc-200 flex items-center gap-2">
                                 <Users size={18} className="text-blue-400" />
                                 User Management
                              </h2>
                              <span className="text-xs font-mono text-zinc-500">Last 50 Users</span>
                           </div>
                           
                           <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-zinc-400">
                               <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                                 <tr>
                                   <th className="px-6 py-3 font-medium">User Details</th>
                                   <th className="px-6 py-3 font-medium">Role</th>
                                   <th className="px-6 py-3 font-medium">Joined</th>
                                   <th className="px-6 py-3 font-medium text-right">Actions</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-zinc-800">
                                 {users.map((u: any) => (
                                   <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                                     <td className="px-6 py-4">
                                        <div className="font-medium text-white">{u.full_name || "No Name"}</div>
                                        <div className="text-xs text-zinc-500 font-mono">{u.email || u.id.slice(0, 8) + '...'}</div>
                                     </td>
                                     <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                           u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                           u.role === 'cafe_owner' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                           'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                        }`}>
                                           {u.role || 'customer'}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 text-xs text-zinc-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                          {/* TODO: Add Edit Role Button */}
                                          <DeleteUserButton userId={u.id} />
                                        </div>
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                        </section>

                        {/* Affiliate Payouts */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                           <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-emerald-500/5">
                              <h2 className="font-bold text-emerald-200 flex items-center gap-2">
                                 <TrendingUp size={18} className="text-emerald-400" />
                                 Affiliate Payouts
                              </h2>
                              <span className="text-xs font-mono text-zinc-500">Revenue Share (20%)</span>
                           </div>

                           <div className="p-6 border-b border-zinc-800 bg-emerald-900/10">
                             <h3 className="text-sm font-bold text-emerald-300 mb-3">Assign New Affiliate Code</h3>
                             <CreateReferralCodeForm />
                           </div>
                           
                           <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-zinc-400">
                               <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                                 <tr>
                                   <th className="px-6 py-3 font-medium">Affiliate</th>
                                   <th className="px-6 py-3 font-medium text-center">Code</th>
                                   <th className="px-6 py-3 font-medium text-center">Active Cafes</th>
                                   <th className="px-6 py-3 font-medium text-right">Revenue</th>
                                   <th className="px-6 py-3 font-medium text-right">Commission</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-zinc-800">
                                 {affiliateMetrics
                                    .sort((a: any, b: any) => b.revenue_share - a.revenue_share)
                                    .map((aff: any) => (
                                   <tr key={aff.id} className="hover:bg-zinc-900/30 transition-colors">
                                     <td className="px-6 py-4">
                                        <div className="font-medium text-white">{aff.referrer?.full_name || "Unknown"}</div>
                                        <div className="text-xs text-zinc-500">{aff.referrer?.email}</div>
                                     </td>
                                     <td className="px-6 py-4 text-center font-mono text-xs text-indigo-400 bg-indigo-500/10 rounded-md px-2 py-1 mx-auto w-fit">
                                        {aff.code}
                                     </td>
                                     <td className="px-6 py-4 text-center font-medium text-white">
                                        {aff.active_count}
                                     </td>
                                     <td className="px-6 py-4 text-right text-zinc-500">
                                        ${aff.monthly_revenue.toFixed(2)}
                                     </td>
                                     <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                        ${aff.revenue_share.toFixed(2)}
                                     </td>
                                   </tr>
                                 ))}
                                 {affiliateMetrics.length === 0 && (
                                    <tr>
                                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-600 italic">No affiliates found.</td>
                                    </tr>
                                 )}
                               </tbody>
                             </table>
                           </div>
                        </section>

                        {/* Recent Activity Feed */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                           <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                              <h2 className="font-bold text-zinc-200 flex items-center gap-2">
                                 <Activity size={18} className="text-emerald-400" />
                                 Live Feed
                              </h2>
                              <span className="text-xs font-mono text-zinc-500">Real-time</span>
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
                                 {activities.map((log: any, i) => {
                                   // Safe navigation for nested relations
                                   const userName = log.card?.user?.full_name || log.card?.user?.email || "Unknown User";
                                   const cafeName = log.card?.cafe?.name || "Unknown Cafe";
                                   
                                   return (
                                    <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                                      <td className="px-6 py-4 font-medium text-white">{userName}</td>
                                      <td className="px-6 py-4 flex items-center gap-2">
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

                      {/* Sidebar Area (1 col) */}
                      <div className="space-y-8">
                        
                        {/* Partner Requests */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm h-fit">
                           <div className="px-6 py-4 border-b border-zinc-800 bg-orange-500/5 flex justify-between items-center">
                              <h2 className="font-bold text-orange-200 flex items-center gap-2">
                                 <AlertCircle size={18} className="text-orange-400" />
                                 Partner Requests
                              </h2>
                              {pendingPartners.length > 0 && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/20">
                                  {pendingPartners.length} New
                                </span>
                              )}
                           </div>
                           
                           <div className="p-4 space-y-4">
                             {pendingPartners.length === 0 ? (
                                <div className="text-center py-8">
                                  <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-700">
                                    <Check size={20} />
                                  </div>
                                  <p className="text-zinc-500 text-sm">All caught up! No pending requests.</p>
                                </div>
                             ) : (
                                pendingPartners.map((partner: any) => (
                                  <div key={partner.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                       <div>
                                         <h3 className="font-bold text-white text-sm">{partner.full_name}</h3>
                                         <p className="text-zinc-500 text-xs mt-0.5">{partner.email || "No email"}</p>
                                       </div>
                                       <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                                         {partner.requested_role || "Partner"}
                                       </span>
                                    </div>
                                    <div className="pt-3 border-t border-zinc-800 flex justify-end">
                                       <ApprovePartnerButton userId={partner.id} />
                                    </div>
                                  </div>
                                ))
                             )}
                           </div>
                        </section>

                         {/* Quick Actions / System Status */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden p-6 space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Health</h3>
                            <div className="space-y-3">
                               <div className="flex justify-between text-sm">
                                  <span className="text-zinc-400">Database</span>
                                  <span className="text-emerald-400 font-medium">Connected</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                  <span className="text-zinc-400">Storage</span>
                                  <span className="text-emerald-400 font-medium">Healthy</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                  <span className="text-zinc-400">API Latency</span>
                                  <span className="text-zinc-200 font-mono">45ms</span>
                               </div>
                            </div>
                        </section>
                      </div>
                    </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm hover:bg-zinc-900/80 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-zinc-700">
           {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
           {trend}
        </span>
      </div>
    </div>
  );
}


