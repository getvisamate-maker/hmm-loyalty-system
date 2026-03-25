import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Lock, Server } from "lucide-react";

export const metadata = {
  title: "Service Agreement - hmmLoyalty",
  description: "Terms of Service and Agreement for hmmLoyalty platform usage.",
};

export default function ServiceAgreement() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation Header */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">
            Legal & Terms
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20">
            Official Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Service Agreement
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto text-lg leading-relaxed">
            Your trust is our currency. Here is a clear, concise summary of how hmmLoyalty operates and protects your business.
          </p>
        </div>

        <div className="grid gap-8 mt-12">
          
          {/* Section 1: Data Ownership */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-indigo-500/30 transition-colors group">
            <div className="mb-6 bg-zinc-800 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Database className="text-zinc-400 group-hover:text-indigo-400 transition-colors" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
              1. Data Ownership
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              The Cafe Owner owns their customer list. <strong className="text-zinc-200">hmmLoyalty does not sell or share your specific cafe's data</strong> with third parties or competitors. Your business relationships remain exclusively yours.
            </p>
          </section>

          {/* Section 2: Security */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
            <div className="mb-6 bg-zinc-800 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <ShieldCheck className="text-zinc-400 group-hover:text-emerald-400 transition-colors" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
              2. Security
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              All transactions (stamps) are protected by <strong className="text-zinc-200">Row Level Security (RLS)</strong> at the database level. We enforce a strict <strong className="text-zinc-200">5-minute time-lock</strong> between stamps to prevent fraud and accidental double-stamping.
            </p>
          </section>

          {/* Section 3: Privacy */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
            <div className="mb-6 bg-zinc-800 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Lock className="text-zinc-400 group-hover:text-purple-400 transition-colors" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
              3. Privacy
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              We practice data minimalism. We only collect the absolute minimum data required to run the loyalty program (User ID and visit timestamps). <strong className="text-zinc-200">No sensitive financial data</strong> is stored on our servers.
            </p>
          </section>

          {/* Section 4: Service */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-orange-500/30 transition-colors group">
            <div className="mb-6 bg-zinc-800 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Server className="text-zinc-400 group-hover:text-orange-400 transition-colors" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
              4. Service Scope
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              hmmLoyalty provides the digital infrastructure and platform. The <strong className="text-zinc-200">Cafe Owner is solely responsible</strong> for honoring the rewards earned by customers as displayed in the app.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-sm">
            Last updated: March 25, 2026
          </p>
        </div>
      </main>
    </div>
  );
}
