"use client";

import { useState, useEffect } from "react";
import { Coffee, Gift, PartyPopper } from "lucide-react";

interface LoyaltyCardProps {
  cafeName: string;
  stampsRequired: number;
  currentStamps: number;
  logoUrl?: string;
}

export function LoyaltyCard({ cafeName, stampsRequired, currentStamps, logoUrl }: LoyaltyCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  
  const isCompleted = currentStamps >= stampsRequired;

  useEffect(() => {
    if (isCompleted) {
      setCelebrate(true);
    }
  }, [isCompleted]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card Container - Removed absolute positioning and fixed aspect ratio for better mobile support */}
      <div className={`transition-all duration-700 ease-in-out transform ${celebrate ? "scale-105" : ""}`}>
        
        {/* Increased contrast: lighter gradient start, lighter border */}
        <div className="relative w-full bg-gradient-to-br from-zinc-800 to-black rounded-3xl shadow-2xl overflow-hidden border border-white/15 flex flex-col p-6 min-h-[240px]">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start relative z-20 mb-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none drop-shadow-md">{cafeName}</h1>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mt-2">Loyalty Card</p>
              </div>
              {logoUrl ? (
                <img src={logoUrl} alt={cafeName} className="w-12 h-12 rounded-full border-2 border-zinc-700 bg-zinc-800 object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-lg border border-white/10">
                  {cafeName.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Stamps Grid */}
            <div className="flex-grow flex items-center justify-center relative z-20 py-4">
              <div className="grid grid-cols-5 gap-3 w-full">
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const isStamped = i < currentStamps;
                  
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-full flex items-center justify-center relative transition-all duration-500 ${
                        isStamped 
                          ? "bg-white text-indigo-600 shadow-lg shadow-white/20 scale-100" 
                          : "bg-black/40 border border-white/10 text-zinc-600"
                      }`}
                    >
                      {isStamped ? (
                        <Coffee size={18} className={`transition-all duration-500 ${celebrate ? "animate-bounce" : ""}`} strokeWidth={3} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer / Status */}
            <div className="flex items-center justify-between relative z-20 mt-6 pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Progress</span>
                <span className="text-white font-bold text-lg">
                  {currentStamps} <span className="text-zinc-500 text-sm font-normal">/ {stampsRequired}</span>
                </span>
              </div>
              
              {isCompleted ? (
                <div className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide shadow-lg shadow-green-900/20 animate-pulse">
                  <Gift size={14} />
                  <span>Free Coffee!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Celebration Overlay for Free Coffee */}
      {celebrate && (
        <div className="mt-8 text-center animate-pulse">
          <div className="inline-block p-4 rounded-full bg-indigo-500/10 mb-4 border border-indigo-500/20">
            <PartyPopper className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Completed!</h2>
          <p className="text-zinc-400 max-w-xs mx-auto mb-6 text-sm">
            Show this screen to the barista to redeem for your free coffee reward.
          </p>
          <div className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-200 transition-colors">
            Redeem Reward
          </div>
        </div>
      )}
    </div>
  );
}
