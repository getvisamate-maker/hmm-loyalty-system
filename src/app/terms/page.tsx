import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Lock, Server } from "lucide-react";

export const metadata = {
  title: "Terms of Service - HMM Loyalty",
  description: "Terms of Service and Agreement for HMM Loyalty platform usage.",
};

export default function TermsOfService() {
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
            Terms of Service
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-12 relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="space-y-6 text-center mb-16">
          <p className="text-fuchsia-400 font-bold tracking-widest text-xs uppercase bg-purple-500/10 inline-block px-4 py-1.5 rounded-full border border-purple-500/20">
            Legal Agreement
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Terms of Service
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg leading-relaxed">
            Your trust is our currency. Here is a clear, concise summary of how HMM Loyalty operates and protects your business.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Section 1: Data Ownership */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using HMM Loyalty ("Platform", "we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </section>

          {/* Section 2: Subscriptions & Payments */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">2. Subscriptions & Payments</h2>
              <p className="leading-relaxed">
                We offer a 14-day free trial on our subscription plans. After the trial period, you will be billed automatically on a recurring monthly or annual basis unless cancelled. Payments are processed securely via Stripe. All fees are strictly non-refundable once processed.
              </p>
            </div>
          </section>

          {/* Section 3: Data Ownership */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-zinc-300 space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Ownership & Responsibility</h2>
              <p className="leading-relaxed">
                As a Cafe Owner, you own your customer list. <strong className="text-white">We do not sell or share your specific cafe's data</strong> with third parties or competitors. You are solely responsible for ensuring your loyalty programs and rewards do not violate any local laws and for honoring rewards earned by your customers on the platform.
              </p>
            </div>
          </section>

          {/* Section 4: Security & Restrictions */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative z-10 text-zinc-300 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                <p className="leading-relaxed">
                   You agree not to misuse the Platform, including but not limited to: reverse engineering, exploiting security vulnerabilities, or creating fake accounts to manipulate rewards. We reserve the right to suspend or terminate accounts engaging in fraudulent activity.
                </p>
             </div>
          </section>

          {/* Section 5: Affiliates */}
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-zinc-900/60 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative z-10 text-zinc-300 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">5. Affiliate Program Terms</h2>
                <p className="leading-relaxed">
                   If you participate in our Affiliate Program, your participation is governed by our specific <Link href="/affiliate-terms" className="text-purple-400 hover:text-fuchsia-400 underline underline-offset-4">Affiliate Terms of Service</Link>. By generating or sharing an affiliate link, you explicitly agree to those terms.
                </p>
             </div>
          </section>
        </div>        <div className="pt-16 border-t border-white/5 text-center">
          <p className="text-zinc-500 text-sm">
            Last updated: April 1, 2026
          </p>
        </div>
      </main>
    </div>
  );
}
