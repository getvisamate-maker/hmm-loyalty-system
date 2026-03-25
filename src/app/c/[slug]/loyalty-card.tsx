"use client";

import { useState, useEffect } from "react";
import { Coffee, Gift, ScanLine, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { addStamp } from "./actions";
import { usePathname } from "next/navigation";

const brandColor = "#4f46e5"; // Indigo-600

interface LoyaltyCardProps {
  cafeId: string;
  cardId: string;
  cafeName: string;
  stampsRequired: number;
  currentStamps: number;
  logoUrl?: string;
}

export function LoyaltyCard({ cafeId, cardId, cafeName, stampsRequired, currentStamps, logoUrl }: LoyaltyCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const [showPinPad, setShowPinPad] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();
  
  const isCompleted = currentStamps >= stampsRequired;

  useEffect(() => {
    // If the card is full on load (e.g. they refreshed without redeeming), show celebration state
    setCelebrate(isCompleted);
    if (!loading && !isCompleted && !celebrate) setShowPinPad(false);
  }, [isCompleted, loading]);

  const triggerConfetti = (isMasive = false) => {
    if (isMasive) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [brandColor, "#ffffff", "#fbbf24"]
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [brandColor, "#ffffff", "#fbbf24"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [brandColor, "#ffffff", "#fbbf24"]
      });
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    
    setLoading(true);
    setError("");

    // Store previous stamp count to detect if we just added a stamp (not redeem)
    const prevStamps = currentStamps;

    // Call server action
    const result: any = await addStamp(cafeId, cardId, pin, pathname);
    
    setLoading(false);
    
    if (result.success) {
      setPin("");
      setShowPinPad(false);

      if (result.redeemed) {
        // === REDEMPTION JOY ===
        setShowRedemptionModal(true);
        triggerConfetti(true); // Massive confetti
      } else {
        // === STAMP ADDED JOY ===
        // Only trigger small confetti if stamp count increased
        if (currentStamps >= prevStamps) {
           triggerConfetti(false); 
        }
      }
    } else {
      setError(result.message || "Something went wrong.");
      setPin(""); 
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto relative flex flex-col items-center">
      <AnimatePresence>
        {showRedemptionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none" />
              
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-pulse">
                <Gift className="text-white w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">Reward Unlocked!</h2>
              <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                You&apos;ve earned a free coffee! Show this screen to the staff to claim it.
              </p>

              <button 
                onClick={() => setShowRedemptionModal(false)}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
              >
                Okay, got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card Container */}
      <motion.div 
        layout
        className={`w-full transition-all duration-700 ease-in-out transform ${celebrate ? "scale-105" : ""}`}
      >
        
        {/* Card Component */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-zinc-800/80 to-black/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col p-8 justify-between">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/30 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none mix-blend-screen"></div>

            {/* Header */}
            <div className="flex justify-between items-start relative z-20">
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none drop-shadow-lg">{cafeName}</h1>
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-90">Loyalty Pass</p>
              </div>
              {logoUrl ? (
                <img src={logoUrl} alt={cafeName} className="w-12 h-12 rounded-full border border-white/20 bg-zinc-800 object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border border-white/20 text-lg">
                  {cafeName.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Stamps Grid - Auto-fit based on stamp count */}
            <div className="flex-grow flex items-center justify-center relative z-20 py-8">
              <div 
                className={`grid gap-4 w-full justify-items-center ${
                  stampsRequired <= 4 ? "grid-cols-2 max-w-[200px]" : 
                  stampsRequired <= 6 ? "grid-cols-3" : 
                  stampsRequired <= 9 ? "grid-cols-3" : 
                  stampsRequired <= 10 ? "grid-cols-5" : "grid-cols-4"
                }`}
              >
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const isStamped = i < currentStamps;
                  
                  return (
                    <motion.div 
                      key={i} 
                      whileTap={{ scale: 0.9 }}
                      initial={false}
                      animate={{ 
                        scale: isStamped ? 1 : 1,
                        backgroundColor: isStamped ? "#ffffff" : "rgba(255,255,255,0.05)",
                        borderColor: isStamped ? "transparent" : "rgba(255,255,255,0.1)"
                      }}
                      className={`aspect-square w-full rounded-2xl flex items-center justify-center relative transition-all duration-300 ${
                        isStamped 
                          ? "shadow-[0_0_20px_rgba(255,255,255,0.4)] text-indigo-600" 
                          : "border border-white/10 text-zinc-700"
                      }`}
                    >
                      {isStamped ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Coffee size={stampsRequired > 10 ? 14 : 20} strokeWidth={3.5} />
                        </motion.div>
                      ) : (
                         <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer with Status */}
            <div className="relative z-20 flex justify-between items-end">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Progress</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-white leading-none">{currentStamps}</span>
                    <span className="text-sm font-medium text-zinc-500">/ {stampsRequired}</span>
                  </div>
               </div>

               {isCompleted ? (
                 <div className="px-4 py-2 bg-yellow-500/20 rounded-xl border border-yellow-500/20 flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wide animate-pulse">
                    <Gift size={14} />
                    <span>Reward Unlocked</span>
                 </div>
               ) : (
                 <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">Next Reward</p>
                    <p className="text-xs text-zinc-300 font-medium mt-0.5">Free Coffee</p>
                 </div>
               )}
            </div>
        </div>
      </motion.div>

      {/* Action Area */}
      <AnimatePresence mode="popLayout">
        {!showPinPad ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 w-full"
          >
            {isCompleted ? (
               <button
                  onClick={() => setShowPinPad(true)}
                  className="w-full group relative bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden"
               >
                  <span className="relative z-10 flex items-center gap-2">
                    <Gift size={20} className="animate-bounce" />
                    Use Reward
                  </span>
               </button>
            ) : (
              <button
                onClick={() => setShowPinPad(true)}
                className="w-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ScanLine size={20} className="text-indigo-400" />
                <span>Stamp Card</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 50 }}
             className="mt-4 w-full bg-zinc-900 rounded-[2rem] p-6 shadow-2xl border border-zinc-800"
          >
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Staff PIN</h3>
                <button onClick={() => setShowPinPad(false)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors">
                   <X size={16} className="text-zinc-400" />
                </button>
             </div>

             <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="relative flex justify-center">
                   <input
                      type="tel"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-4xl font-mono tracking-[0.5em] bg-black border border-zinc-700 rounded-xl py-5 focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-zinc-800"
                      placeholder="••••"
                      autoFocus
                   />
                </div>
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs font-bold text-center bg-red-900/10 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                   type="submit"
                   disabled={pin.length !== 4 || loading}
                   className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      pin.length === 4 
                      ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10" 
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                   }`}
                >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                       {isCompleted ? "Verfiy & Redeem" : "Verify"}
                     </>
                   )}
                </button>
             </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
