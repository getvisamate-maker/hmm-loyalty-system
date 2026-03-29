import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldCheck, Zap, Rocket, Check } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "../settings/actions";
import { headers } from "next/headers";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host") || "localhost:3000";
  const currentUrl = `${protocol}://${host}/dashboard/cafe/${slug}/billing`;

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get Cafe
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!cafe) redirect("/dashboard");

  const currentPlan = cafe.plan_level || 'standard';
  const status = cafe.status || 'inactive';

  const PLAN_DETAILS = [
    {
      id: 'standard',
      name: 'Standard',
      price: '$19',
      desc: 'Perfect for small shops starting out.',
      features: ['Basic Analytics', 'Digital Loyalty Cards', 'Single Location'],
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$39',
      desc: 'Grow your customer base with marketing.',
      features: ['Advanced Analytics', 'Email Marketing', 'Custom Branding'],
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$79',
      desc: 'For serious businesses that need it all.',
      features: ['Staff Management (POS)', 'Export Data', 'Multi-location Priority'],
      icon: <Rocket className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/dashboard/cafe/${slug}`} className="text-zinc-500 hover:text-white transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-zinc-400 mt-2">Manage your subscription for {cafe.name}</p>
      </div>

      {status === 'active' && (
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
              <Check size={18} /> Active Subscription
            </h3>
            <p className="text-sm text-emerald-500/80 mt-1">You are currently on the <strong className="capitalize">{currentPlan}</strong> plan.</p>
          </div>
          <a href="#" className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg transition-colors border border-emerald-500/30">
            Manage Billing
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {PLAN_DETAILS.map((plan) => (
          <div key={plan.id} className={`relative bg-zinc-900 rounded-3xl p-8 border ${plan.popular ? 'border-amber-500 shadow-xl shadow-amber-900/20 md:scale-105 z-10' : 'border-zinc-800'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              {plan.icon}
              <h3 className="text-xl font-bold mt-4 text-white">{plan.name}</h3>
              <p className="text-zinc-400 text-sm mt-2 min-h-[40px]">{plan.desc}</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="text-zinc-500 font-medium">/mo</span>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <form action={createCheckoutSession}>
              <input type="hidden" name="plan_level" value={plan.id} />
              <input type="hidden" name="cafe_id" value={cafe.id} />
              <input type="hidden" name="cafe_slug" value={slug} />
              <input type="hidden" name="current_url" value={currentUrl} />
              
              <button 
                type="submit" 
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {currentPlan === plan.id && status === 'active' ? 'Current Plan' : 'Subscribe'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
