import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Affiliate Terms - HMM Loyalty",
  description: "Terms and conditions for the HMM Loyalty Affiliate Program.",
};

export default function AffiliateTerms() {
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
            Affiliate Terms
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-12 relative z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="space-y-6 text-center mb-16">
          <p className="text-fuchsia-400 font-bold tracking-widest text-xs uppercase bg-purple-500/10 inline-block px-4 py-1.5 rounded-full border border-purple-500/20">
            Partnership Agreement
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Affiliate Terms
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg leading-relaxed">
            The rules of engagement for our affiliate and referral partners. Keep it clean, fair, and mutually beneficial.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Section 1 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">1. Enrollment & Tracking</h2>
              <p className="leading-relaxed">
                By participating in the HMM Loyalty Affiliate Program, you agree to these terms. We track referrals via unique affiliate links or codes. A referral is only valid if the user clicks your link and signs up within the designated cookie window (typically 30 days).
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">2. Commissions & Payouts</h2>
              <p className="leading-relaxed">
                You will earn a recurring commission on all subscription fees paid by your referred customers, as long as they remain active. 
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Payouts are processed monthly once minimum payout thresholds are met.</li>
                <li>Refunded or charged-back payments will result in a deduction of the corresponding commission.</li>
                <li>Self-referrals (using your own link to create a separate account) are strictly prohibited and will void commissions.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">3. Acceptable Promotion</h2>
              <p className="leading-relaxed">
                You are encouraged to promote HMM Loyalty to cafe owners through organic content, social media, and direct networking. However, the following practices are forbidden:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Bidding on our trademark or branded terms in paid search (Google Ads, Bing, etc.).</li>
                <li>Sending unsolicited bulk email (SPAM).</li>
                <li>Implying you are an official employee or formal representative of HMM Loyalty.</li>
                <li>Posting your links on coupon code websites to hijack organic traffic.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">4. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to review, suspend, or terminate your affiliate account at any time if we determine that you have violated these terms, engaged in fraudulent activity, or promoted the brand in a way that harms our reputation.
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
