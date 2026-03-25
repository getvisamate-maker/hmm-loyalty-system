"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createCafe } from "./actions";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Coffee, ArrowRight, ArrowLeft, Upload, Check, 
  Palette, Lock, Stamp, Rocket, LayoutTemplate 
} from "lucide-react";

// --- Types ---
type SetupData = {
  name: string;
  slug: string;
  stamps_required: number;
  pin_code: string;
  brand_color: string;
  logo: File | null;
};

// --- Framer Variants ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(10px)",
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    filter: "blur(10px)",
  }),
};

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<SetupData>({
    name: "",
    slug: "",
    stamps_required: 10,
    pin_code: "",
    brand_color: "#4f46e5", // Default Indigo
    logo: null,
  });

  // Preview State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Auto-generate slug
  useEffect(() => {
    if (step === 1 && formData.name) {
      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, step]);

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.slug)) return setError("Please fill in all fields");
    if (step === 2 && (!formData.pin_code || formData.pin_code.length < 4)) return setError("Please enter a 4-digit PIN");
    
    setError(null);
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("slug", formData.slug);
    submitData.append("stamps_required", formData.stamps_required.toString());
    submitData.append("pin_code", formData.pin_code);
    submitData.append("brand_color", formData.brand_color);
    if (formData.logo) {
      submitData.append("logo", formData.logo);
    }

    // Call server action
    const result = await createCafe(null, submitData);

    if (result.success) {
      // Confetti Explosion!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [formData.brand_color, "#ffffff"]
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [formData.brand_color, "#ffffff"]
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
             router.push(`/dashboard/cafe/${result.slug}`);
        }
      };
      
      frame();
      
    } else {
      setIsLoading(false);
      setError(result.message || "Something went wrong");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col md:flex-row overflow-hidden selection:bg-orange-500/30">
      
      {/* --- Left Side: Form --- */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-12 relative z-10">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Create your Cafe</h1>
            <p className="text-zinc-400">Step {step} of 3</p>
            <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${(step / 3) * 100}%` }} 
                 className="h-full bg-orange-500" 
                 transition={{ duration: 0.5 }}
               />
            </div>
          </div>

          {/* Form Container */}
          <div className="relative min-h-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* --- STEP 1: IDENTITY --- */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Cafe Name</label>
                    <input
                      autoFocus
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Daily Grind"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder:text-zinc-600 font-medium text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Cafe URL 
                        <span className="text-zinc-600 ml-2 font-normal text-xs">(auto-generated)</span>
                    </label>
                    <div className="flex items-center bg-zinc-900/30 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500">
                      <span className="text-zinc-600 mr-1">hmm.loyalty/c/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        className="bg-transparent outline-none flex-1 text-zinc-300 font-mono text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 2: LOGIC --- */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-8"
                >
                   <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                        <Stamp size={16} />
                        Stamps to Reward
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {[5, 8, 10, 12].map(num => (
                            <button
                                key={num}
                                onClick={() => setFormData({ ...formData, stamps_required: num })}
                                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                    formData.stamps_required === num 
                                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
                                }`}
                            >
                                {num} Cups
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                        <Lock size={16} />
                        Barista PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={formData.pin_code}
                      onChange={e => setFormData({ ...formData, pin_code: e.target.value.replace(/\D/g, '') })}
                      placeholder="****"
                      className="w-full tracking-[1em] text-center bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder:tracking-normal placeholder:text-zinc-700 font-mono text-2xl"
                    />
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                        Used by staff to verify stamps (Keep it simple, e.g. 2024)
                    </p>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 3: BRANDING --- */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-8"
                >
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                            <Palette size={16} />
                            Brand Color
                        </label>
                        <div className="flex gap-4 flex-wrap">
                            {[
                                "#4f46e5", // Indigo
                                "#ea580c", // Orange
                                "#059669", // Emerald
                                "#db2777", // Pink
                                "#7c3aed", // Violet
                                "#2563eb", // Blue
                                "#18181b", // Zinc (Black)
                            ].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setFormData({ ...formData, brand_color: color })}
                                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                                        formData.brand_color === color ? "ring-2 ring-white scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                                    }`}
                                    style={{ backgroundColor: color }}
                                >
                                    {formData.brand_color === color && <Check size={16} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                            <Upload size={16} />
                            Cafe Logo
                        </label>
                        <div 
                            className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all cursor-pointer relative overflow-hidden group"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-full mb-2 z-10 shadow-lg border-2 border-zinc-800" />
                            ) : (
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:bg-zinc-800 transition-colors z-10">
                                     <Upload className="text-zinc-600 group-hover:text-zinc-300" />
                                </div>
                            )}
                            <p className="text-sm font-medium z-10">{logoPreview ? "Click to change" : "Click to upload logo"}</p>
                            <input 
                                id="logo-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Validation Error */}
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
                <button
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl font-bold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
            
            <button
                onClick={step === 3 ? handleFinish : handleNext}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
                {isLoading ? (
                    "Creating..."
                ) : step === 3 ? (
                    <>Launch Cafe <Rocket size={20} /></>
                ) : (
                    <>Next Step <ArrowRight size={20} /></>
                )}
            </button>
          </div>

        </div>
      </div>

      {/* --- Right Side: Live Preview --- */}
      <div className="hidden md:flex flex-1 bg-zinc-900 relative items-center justify-center p-12 overflow-hidden border-l border-white/5">
         
         {/* Live Preview Label */}
         <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-bold text-zinc-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Preview
         </div>

         {/* Phone Frame */}
         <div className="relative w-[320px] h-[640px] bg-black border-[8px] border-zinc-800 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
            
            {/* Dynamic Card Preview */}
            <div className="h-full w-full bg-white dark:bg-zinc-950 p-6 flex flex-col">
                <div className="h-6 w-32 bg-zinc-800 rounded-full mx-auto mb-8 opacity-20" /> {/* Notch */}
                
                <div className="flex-1 flex flex-col justify-center">
                    <motion.div 
                        initial={false}
                        animate={{ 
                            boxShadow: `0 20px 40px -10px ${formData.brand_color}40`,
                            borderColor: `${formData.brand_color}30`
                        }}
                        className="bg-zinc-50 dark:bg-zinc-900 border rounded-3xl p-6 relative overflow-hidden mb-6"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-2xl text-zinc-900 dark:text-white transition-all">
                                    {formData.name || "Cafe Name"}
                                </h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1">Loyalty Member</p>
                            </div>
                            {logoPreview ? (
                                <img src={logoPreview} className="w-12 h-12 rounded-full object-cover shadow-sm bg-white" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <Coffee className="text-zinc-400" size={20} />
                                </div>
                            )}
                        </div>

                        {/* Stamps Grid */}
                        <div className="grid grid-cols-5 gap-3 mb-6">
                            {Array.from({ length: formData.stamps_required }).map((_, i) => (
                                <div key={i} className="aspect-square rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                                     {i === 0 && ( /* Simulate one stamp */
                                        <motion.div 
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-full h-full flex items-center justify-center text-white"
                                          style={{ backgroundColor: formData.brand_color }}
                                        >
                                            <Coffee size={12} />
                                        </motion.div>
                                     )}
                                </div>
                            ))}
                        </div>

                         {/* Footer */}
                         <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                            <span>1 / {formData.stamps_required} Stamps</span>
                            <span style={{ color: formData.brand_color}}>Collect more!</span>
                         </div>
                    </motion.div>

                    <div className="text-center space-y-2">
                        <div className="inline-block p-4 bg-white dark:bg-white rounded-2xl mx-auto shadow-sm">
                            <div className="w-32 h-32 bg-zinc-900 pattern-dots opacity-10" />
                        </div>
                        <p className="text-xs font-mono text-zinc-500 mt-4">SCAN TO COLLECT</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
}
