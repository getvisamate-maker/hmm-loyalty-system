// src/components/ReferralBanner.tsx
"use client";

import { Sparkles, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function ReferralBanner({ userEmail }: { userEmail?: string }) {
  const [isVisible, setIsVisible] = useState(true);

  // Simple local storage persistence to not annoy user immediately if they close it
  useEffect(() => {
    const hidden = localStorage.getItem("hideReferralBanner");
    if (hidden && new Date(hidden) > new Date()) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Hide for 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    localStorage.setItem("hideReferralBanner", nextWeek.toISOString());
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-3 px-4 relative overflow-hidden shadow-lg border-b border-white/10">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="bg-white/20 p-2 rounded-full hidden sm:block">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <p className="text-sm font-medium">
            <span className="font-bold text-yellow-300 block sm:inline mr-1">Earn 20% Lifetime Commission!</span>
            Know a cafe owner? Refer them to hmmLoyalty.
          </p>
        </div>

        <div className="flex items-center gap-4">
           {/* If we have the email, we can pre-fill a mailto or link to a dedicated landing page */}
           {/* For now, linking to a Contact/Affiliate section or just a mailto for interest */}
          <Link
            href="mailto:partners@hmmloyalty.com?subject=I%20want%20to%20be%20an%20Affiliate&body=Hey%2C%20I'd%20love%20to%20join%20the%20partner%20program!"
            className="text-xs font-bold bg-white text-indigo-900 px-4 py-2 rounded-full hover:bg-yellow-300 hover:text-indigo-950 transition-colors flex items-center gap-1 shadow-lg shadow-black/20"
          >
            Join Partner Program <ArrowRight size={14} />
          </Link>
          
          <button 
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
