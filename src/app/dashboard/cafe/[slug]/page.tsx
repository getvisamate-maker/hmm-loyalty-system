import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isFeatureEnabled, FEATURES, PlanLevel } from "@/utils/features";
import ModernCafeDashboard from "./components/client-dashboard";

// Force dynamic rendering
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

  // Package all stats for client prop
  const stats = {
    totalCustomers,
    totalStampsReal,
    totalRedeemedReal,
    currentMonthCount,
    optedInCount
  };

  const isGrowthOrHigher = ['growth', 'pro'].includes(plan.toLowerCase());
  const isPro = plan.toLowerCase() === 'pro';

  // 14-day trial logic
  const createdAtDate = new Date(cafe.created_at);
  const now = new Date();
  const trialDays = 14;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceCreation = Math.floor((now.getTime() - createdAtDate.getTime()) / msPerDay);
  
  // If the trial has expired and they don't have an active Stripe sub (or active status via Stripe)
  // For safety, checks if plan is standard and days > 14
  // If they have stripe_subscription_id, we assume they are paying (or their plan isn't 'standard' anymore if they upgraded).
  const isTrialExpired = daysSinceCreation > trialDays && plan === 'standard' && !cafe.stripe_subscription_id;

  // Fetch staff list for Pro users
  let staffList = [];
  if (isPro) {
    const { data: staff } = await supabase
      .from("cafe_staff")
      .select("*")
      .eq("cafe_id", cafe.id)
      .order("created_at", { ascending: true });
    
    staffList = staff || [];
  }

  return (
    <ModernCafeDashboard 
      cafe={cafeWithSecret}
      stats={stats}
      dailyFlowArray={dailyFlowArray}
      recentLogs={recentLogs}
      publicUrl={publicUrl}
      plan={plan}
      isGrowthOrHigher={isGrowthOrHigher}
      isPro={isPro}
      isTrialExpired={isTrialExpired}
      initialStaff={staffList}
    />
  );
}