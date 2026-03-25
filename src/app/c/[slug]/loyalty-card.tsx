"use client";

import { useState, useEffect } from "react";
import { Coffee, Gift, PartyPopper, ScanLine, X, CheckCircle } from "lucide-react";
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
    <div className="w-full max-w-md mx-auto relative">
      <AnimatePresence>
        {showRedemptionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />
              
              <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-pulse">
                <Gift className="text-white w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Reward Unlocked!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                You've earned a free coffee! Show this screen to your barista to claim it.
              </p>

              <button 
                onClick={() => setShowRedemptionModal(false)}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
              >
                Awesome, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card Container */}
      <motion.div 
        layout
        className={`transition-all duration-700 ease-in-out transform ${celebrate ? "scale-105" : ""}`}
      >
        
        {/* Card Component */}
        <div className="relative w-full bg-gradient-to-br from-zinc-800 to-black rounded-3xl shadow-2xl overflow-hidden border border-white/15 flex flex-col p-6 min-h-[240px]">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center relative z-20 mb-8">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none drop-shadow-md">{cafeName}</h1>
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mt-1.5 opacity-80">Loyalty Member</p>
              </div>
              {logoUrl ? (
                <img src={logoUrl} alt={cafeName} className="w-12 h-12 rounded-full border-2 border-zinc-700 bg-zinc-800 object-cover shadow-lg" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-lg border border-white/10 text-sm">
                  {cafeName.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Stamps Grid - Auto-fit based on stamp count */}
            <div className="flex-grow flex items-center justify-center relative z-20 py-2">
              <div 
                className={`grid gap-3 w-full justify-items-center ${
                  stampsRequired <= 5 ? "grid-cols-5" : 
                  stampsRequired <= 8 ? "grid-cols-4" : 
                  stampsRequired <= 10 ? "grid-cols-5" : "grid-cols-6"
                }`}
              >
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const isStamped = i < currentStamps;
                  const isJustStamped = i === currentStamps - 1; // Used for animation potential
                  
                  return (
                    <motion.div 
                      key={i} 
                      whileTap={{ scale: 0.9 }}
                      initial={false}
                      animate={{ 
                        scale: isStamped ? 1 : 0.9,
                        backgroundColor: isStamped ? "#ffffff" : "rgba(0,0,0,0.4)"
                      }}
                      className={`aspect-square w-full max-w-[50px] rounded-full flex items-center justify-center relative transition-shadow duration-300 ${
                        isStamped 
                          ? "shadow-[0_0_15px_rgba(255,255,255,0.3)] text-indigo-600" 
                          : "border border-white/10 text-zinc-600"
                      }`}
                    >
                      {isStamped ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                          <Coffee size={stampsRequired > 10 ? 14 : 18} strokeWidth={3} />
                        </motion.div>
                      ) : (
                         // Empty State Dot
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer with Status */}
            <div className="relative z-20 mt-6 flex justify-between items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/5">
                <p className="text-xs font-bold text-white">
                  {currentStamps} / {stampsRequired} <span className="opacity-60 font-normal">Stamps</span>
                </p>
              </div>

               {isCompleted ? (
                 <div className="flex items-center gap-2 text-yellow-400 animate-pulse font-bold text-xs uppercase tracking-wide">
                    <Gift size={14} />
                    <span>Reward Ready!</span>
                 </div>
               ) : (
                 <p className="text-[10px] text-zinc-500 font-medium">Scan to collect</p>
               )}
            </div>
        </div>
      </motion.div>

      {/* Action Area */}
      <AnimatePresence mode="wait">
        {!showPinPad ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 flex justify-center"
          >
            {isCompleted ? (
               <button
                  onClick={() => setShowPinPad(true)}
                  className="group relative bg-white text-black font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Gift size={20} className="animate-bounce" />
                    State "Redeem Reward" to Staff
                  </span>
               </button>
            ) : (
              <button
                onClick={() => setShowPinPad(true)}
                className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <ScanLine size={20} />
                <span>Enter Staff PIN to Stamp</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-6 bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
          >
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-900 dark:text-white">Staff Verification</h3>
                <button onClick={() => setShowPinPad(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors">
                   <X size={20} className="text-zinc-500" />
                </button>
             </div>

             <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="relative">
                   <input
                      type="tel"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-4xl font-mono tracking-[1em] bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl py-4 focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="••••"
                      autoFocus
                   />
                </div>
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                   type="submit"
                   disabled={pin.length !== 4 || loading}
                   className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      pin.length === 4 
                      ? "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg" 
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                   }`}
                >
                   {loading ? (
                     <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                       <CheckCircle size={20} />
                       {isCompleted ? "Verfiy & Redeem" : "Verify & Stamp"}
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
