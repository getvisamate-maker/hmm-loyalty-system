import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - HMM Loyalty",
  description: "Privacy Policy explaining how HMM Loyalty handles user data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-500/30">
      {/* Navigation Header */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-fuchsia-400 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">
            Privacy Policy
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-12 relative z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="space-y-6 text-center mb-16">
          <p className="text-fuchsia-400 font-bold tracking-widest text-xs uppercase bg-purple-500/10 inline-block px-4 py-1.5 rounded-full border border-purple-500/20">
            Data Protection
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg leading-relaxed">
            We practice data minimalism. We only collect what is absolutely necessary to make your loyalty experience seamless.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Section 1 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="leading-relaxed">
                <strong className="text-white">For Cafe Owners:</strong> We collect your name, email, cafe details, and payment information (processed securely through Stripe) to manage your account and subscription.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">For Customers:</strong> When a customer scans a loyalty QR code, we create an anonymous session tied to their device. If they choose to secure their pass, we may collect their email or phone number.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use the collected information solely to provide, maintain, and improve the HMM Loyalty platform. This includes tracking stamp progress, processing subscription payments, and preventing fraudulent stamps.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Services</h2>
              <p className="leading-relaxed">
                We do not sell any personal or business data. We use specialized third parties to process necessary functions: 
                <br/>• <strong className="text-white">Stripe:</strong> For subscription payment processing.
                <br/>• <strong className="text-white">Supabase:</strong> For secure database hosting and authentication.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p className="leading-relaxed">
                All data is encrypted in transit and at rest. We use Row Level Security (RLS) to ensure that loyalty data and customer progress can only be accessed by authorized merchant accounts or the customer themselves.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">5. Affiliates & Partners</h2>
              <p className="leading-relaxed">
                If you participate in our <strong className="text-white">Affiliate Program</strong>, we collect your contact and payment payout information to process your commissions. This information is securely handled and only used for administering the affiliate program and applicable tax reporting.
              </p>
            </div>
          </section>

        </div>

        <div className="pt-16 border-t border-white/5 text-center">
          <p className="text-zinc-500 text-sm">
            Last updated: April 1, 2026
          </p>
        </div>
      </main>
    </div>
  );
}
