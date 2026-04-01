"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Coffee, QrCode, BarChart3, CheckCircle2, Gift } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-32 flex flex-col items-center text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block py-1.5 px-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-fuchsia-400 text-sm font-semibold mb-8 tracking-wide">
          v2.0 SaaS Platform Live
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto leading-[1.1] text-white"
      >
        Digitize Your Cafe's Loyalty. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-500">
          No Paper, No App, No Headaches.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
      >
        HMM Loyalty brings your regulars back with a simple, 3-second QR scan. Stop losing money on lost punch cards.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mb-28"
      >
        <Link
          href="/login"
          className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-400 to-purple-500 hover:from-amber-300 hover:to-fuchsia-400 text-black px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
        >
          Start 14-Day Free Trial
        </Link>
        <Link
          href="#pricing"
          className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-md"
        >
          View Pricing
        </Link>
      </motion.div>

      {/* Sleek UI Mockup Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto relative perspective-1000"
      >
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/10 blur-[120px] rounded-full point-events-none"></div>
        
        {/* Floating elements container */}
        <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center transform-style-3d">
          
          {/* Main Card Mockup */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute z-20 w-[320px] md:w-[380px] bg-gradient-to-b from-zinc-800 to-black border border-white/10 shadow-2xl rounded-[2rem] p-6 overflow-hidden"
          >
            {/* Inner top glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Coffee size={24} className="text-black" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">Starlight Cafe</div>
                  <div className="text-fuchsia-400/80 text-xs">Digital Loyalty Pass</div>
                </div>
              </div>
            </div>

            {/* Stamps Grid Mockup */}
            <div className="grid grid-cols-5 gap-3 mb-8 relative z-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    i < 6 
                    ? 'bg-purple-500/20 border border-purple-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                    : 'bg-black/50 border border-white/5'
                  }`}
                >
                  {i < 6 ? (
                    <Coffee size={20} className="text-fuchsia-400" />
                  ) : i === 9 ? (
                    <Gift size={20} className="text-white/10" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/5"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar Mockup */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 relative z-10">
              <div className="flex justify-between text-xs text-white/50 mb-2 font-medium">
                <span>Reward Engine</span>
                <span className="text-fuchsia-400">6 / 10 Stamps</span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 to-fuchsia-400 w-[60%] rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/30 blur-[2px]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating QR Element */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute z-30 bottom-10 right-[10%] md:right-[25%] w-24 h-24 bg-white rounded-2xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center transform rotate-6 border-4 border-zinc-800"
          >
            <div className="relative w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
              {/* Corner squares */}
              <div className="flex justify-between">
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
              </div>
              
              {/* Random grid dots */}
              <div className="flex-1 flex flex-wrap gap-1 p-1 items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-3 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-4 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-4 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-3 bg-black rounded-sm"></div>
              </div>

              {/* Bottom corner square */}
              <div className="flex justify-between items-end">
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Chart Element */}
          <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }}
             className="absolute z-10 top-10 left-[5%] md:left-[20%] w-32 h-32 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl transform -rotate-6 backdrop-blur-md"
          >
             <div className="text-xs text-zinc-500 mb-3">Retention</div>
             <div className="flex items-end gap-2 h-16 w-full opacity-80">
                <div className="w-1/4 bg-zinc-700 h-[40%] rounded-sm"></div>
                <div className="w-1/4 bg-zinc-600 h-[60%] rounded-sm"></div>
                <div className="w-1/4 bg-purple-500/50 h-[80%] rounded-sm"></div>
                <div className="w-1/4 bg-fuchsia-400 h-[100%] rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: <QrCode size={32} className="text-fuchsia-400" />,
      title: "1. Show QR Code",
      desc: "Place your unique display at the register.",
    },
    {
      icon: <ScanLineIcon size={32} className="text-fuchsia-400" />,
      title: "2. Customer Scans",
      desc: "Instant access. Zero app downloads.",
    },
    {
      icon: <BarChart3 size={32} className="text-fuchsia-400" />,
      title: "3. Retain & Grow",
      desc: "Watch occasional buyers become regulars.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-32 border-t border-white/5 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
      
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Frictionless Experience</h2>
        <p className="text-zinc-400 text-lg">Up and running in 3 minutes. Loved by your staff and customers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-zinc-900/40 border border-white/5 rounded-[2rem] p-10 text-center flex flex-col items-center hover:bg-zinc-900/80 transition-all hover:-translate-y-2 hover:border-purple-500/30"
          >
            <div className="w-20 h-20 bg-black rounded-2xl border border-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-shadow">
              {step.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
            <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ScanLineIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
      <path d="M7 12h10"></path>
    </svg>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: isAnnual ? "$24" : "$29",
      desc: "Perfect for independent shops.",
      features: ["Up to 500 customers", "Basic analytics", "Digital punch card", "Email support"],
      isPopular: false,
    },
    {
      name: "Growth",
      price: isAnnual ? "$49" : "$59",
      desc: "For busy, growing cafes.",
      features: ["Unlimited customers", "Advanced analytics", "Custom rewards", "Staff accounts", "Priority support"],
      isPopular: true,
    },
    {
      name: "Pro",
      price: isAnnual ? "$89" : "$99",
      desc: "For local chains and franchises.",
      features: ["Multiple locations", "Staff Management (POS)", "Custom branding", "SMS marketing"],
      isPopular: false,
      comingSoon: true,
    }
  ];

  return (
    <section id="pricing" className="w-full max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Simple, Transparent Pricing</h2>
        <p className="text-fuchsia-400 font-medium mb-8">All plans include a 14-day free trial. Cancel anytime.</p>
        
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 bg-zinc-900 p-2 rounded-full w-fit mx-auto border border-white/5">
            <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
                Monthly
            </button>
            <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isAnnual ? "bg-purple-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
                Annually (Save 20%)
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`relative rounded-3xl p-8 border transition-all duration-300 ${plan.isPopular ? 'bg-gradient-to-b from-zinc-900 to-black border-purple-500/50 shadow-2xl shadow-purple-500/10 md:-translate-y-4 z-10' : 'bg-black border-white/10 hover:border-white/20'}`}
          >
            {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                </div>
            )}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-zinc-400 text-sm mb-8 h-10">{plan.desc}</p>
            <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-zinc-500 font-medium">/mo</span>
            </div>
            
            {plan.comingSoon ? (
                <button
                    disabled
                    className="w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all mb-10 bg-zinc-800 text-zinc-500 cursor-not-allowed"
                >
                    Coming Soon
                </button>
            ) : (
                <Link
                    href="/login"
                    className={`w-full flex items-center justify-center py-4 rounded-xl font-bold transition-all mb-10 ${plan.isPopular ? 'bg-purple-500 text-black hover:bg-fuchsia-400 hover:scale-[1.02]' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                    Start Free Trial
                </Link>
            )}
            
            <ul className="space-y-4">
                {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 size={18} className="text-purple-500 shrink-0" />
                        {feat}
                    </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}


export function FAQSection() {
  const faqs = [
    {
      q: "Do my customers need to download an app?",
      a: "No! Customers just scan the QR code with their regular phone camera and open it instantly in their browser (or save it to Apple/Google Wallet). Zero friction means higher adoption."
    },
    {
      q: "How does the barista know a reward is valid?",
      a: "When a customer earns a free item, the screen shows a highly visible, pulsing 'Claim Reward' button with a time-synced secure animation that cannot be faked with a screenshot."
    },
    {
      q: "Can customers cheat the system and give themselves stamps?",
      a: "No. Your baristas log into a secure Staff Portal (or use a secure PIN) on their own device or POS to authorize stamps. Customers cannot add stamps themselves."
    },
    {
      q: "What if a customer loses their phone?",
      a: "If they linked an email or phone number to their pass, they can instantly recover their loyalty progress on any new device. No more lost punch cards!"
    },
    {
      q: "Are there setup fees or hidden costs?",
      a: "None. You only pay the flat subscription fee. There are zero transaction fees for loyalty stamps, no hidden costs, and setup takes less than 3 minutes."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-32 border-t border-white/5 relative z-10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-zinc-400 text-lg">Everything you need to know about switching to HMM Loyalty.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div 
            key={i} 
            className="bg-zinc-900/50 border border-white/5 hover:border-purple-500/20 rounded-2xl transition-colors overflow-hidden"
          >
            <button 
              onClick={() => toggle(i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <span className="text-lg font-bold text-white pr-8">{faq.q}</span>
              <svg 
                className={`w-6 h-6 text-purple-500 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <motion.div 
              initial={false}
              animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                {faq.a}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartnerSection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-32 border-t border-white/5 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-amber-900/10 blur-[150px] rounded-full pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between bg-black border border-white/10 rounded-[2.5rem] p-12 md:p-20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full"></div>
                
                <div className="max-w-2xl mb-10 md:mb-0 relative z-10">
                    <div className="inline-flex items-center gap-2 text-fuchsia-400 font-semibold mb-6 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm">
                        <Gift size={16} />
                        <span>Partner Program</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Refer Cafes.<br/>Earn 20% Recurring.</h2>
                    <p className="text-zinc-400 text-xl leading-relaxed">
                        Know a cafe that needs an upgrade? Join our partner program and earn a lifetime 20% commission on every cafe you bring to HMM Loyalty.
                    </p>
                </div>
                <div className="w-full md:w-auto relative z-10">
                    <Link
                        href="mailto:partners@hmmloyalty.com?subject=Become%20a%20Partner"
                        className="w-full md:w-auto bg-white hover:bg-zinc-200 text-black px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-2 whitespace-nowrap hover:scale-105"
                    >
                        Become a Partner
                    </Link>
                </div>
             </div>
        </section>
    );
}
