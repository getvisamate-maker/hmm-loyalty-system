import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeroSection, HowItWorks, PricingSection, FAQSection, PartnerSection } from "@/components/LandingClient";

const Logo = () => (
  <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 shadow-lg shadow-purple-500/20">
      <div className="absolute inset-0.5 bg-zinc-950 rounded-[10px] flex items-center justify-center">
        <Sparkles size={16} className="text-fuchsia-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
      </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 relative z-50 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tighter">
            <Logo />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">HmmLoyalty</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden md:block"
            >
              Sign In
            </Link>
            <Link 
              href="/login?mode=signup"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-black transition-all duration-200 bg-purple-500 rounded-lg hover:bg-fuchsia-400 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 w-full flex flex-col items-center">
        <HeroSection />
        <HowItWorks />
        <PricingSection />
        <FAQSection />
        <PartnerSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 relative z-10 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white font-bold text-xl drop-shadow-md">
              <Logo />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">HmmLoyalty</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              The modern loyalty platform bridging the gap between local cafes and their best customers.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Legal</span>
              <Link href="/terms" className="text-zinc-500 hover:text-fuchsia-400 transition-colors text-sm">Terms of Service</Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-fuchsia-400 transition-colors text-sm">Privacy Policy</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-sm tracking-wide uppercase">Product</span>
              <Link href="#pricing" className="text-zinc-500 hover:text-fuchsia-400 transition-colors text-sm">Pricing</Link>
              <Link href="mailto:partners@hmmloyalty.com?subject=Become%20a%20Partner" className="text-zinc-500 hover:text-fuchsia-400 transition-colors text-sm">Partner Program</Link>
              
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} HmmLoyalty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
