"use client";

import { useState } from "react";
import { updateCafeSettings } from "./actions";
import { Save, Check, Palette, Settings, Shield, Info } from "lucide-react";
import { FeatureLock } from "@/components/feature-lock";
import { isFeatureEnabled, FEATURES } from "@/utils/features";
import { LoyaltyCard } from "@/app/c/[slug]/loyalty-card";

export function CafeSettingsForm({ cafe }: { cafe: any }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formData, setFormData] = useState({
    name: cafe.name,
    description: cafe.description || "",
    address: cafe.address || "",
    phone_number: cafe.phone_number || "",
    instagram_url: cafe.instagram_url || "",
    primary_color: cafe.primary_color || "#4f46e5",
    secondary_color: cafe.secondary_color || "#fbbf24",
    stamps_required: cafe.stamps_required,
    security_mode: cafe.security_mode || "visual",
    time_lock_hours: cafe.time_lock_hours || 2,
    pin_code: cafe.pin_code || "0000",
    theme: cafe.theme || "dark",
    stamp_icon: cafe.stamp_icon || "coffee",
    background_url: cafe.background_url || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handlePropChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await updateCafeSettings(cafe.id, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone_number: formData.phone_number,
        instagram_url: formData.instagram_url,
        stamps_required: parseInt(formData.stamps_required.toString()),
        security_mode: formData.security_mode,
        time_lock_hours: parseFloat(formData.time_lock_hours.toString()),
        pin_code: formData.pin_code,
        theme: formData.theme,
        stamp_icon: formData.stamp_icon,
        background_url: formData.background_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      }, cafe.slug);
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to update settings");
      setStatus("idle");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
      
      {/* LEFT COLUMN: SETTINGS FORM */}
      <form onSubmit={handleSubmit} className="xl:col-span-7 space-y-8 pb-32">
        
        {/* Core Info */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold dark:text-white text-zinc-900">Basic Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cafe Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Stamps Needed for Reward</label>
                <input type="number" name="stamps_required" min="1" max="20" required value={formData.stamps_required} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Tell customers about your cafe..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="123 Coffee St. NY, NY" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Instagram URL</label>
                <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="https://instagram.com/your_cafe" />
              </div>
            </div>
          </div>
        </div>

        {/* Design Studio */}
        <FeatureLock isLocked={!isFeatureEnabled(cafe.plan_level, FEATURES.CUSTOM_BRANDING)} title="Design Studio" description="Upgrade to Growth or Pro to apply custom brand colors and icons to your digital loyalty cards.">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <Palette className="w-5 h-5 text-pink-500" />
              <h2 className="text-xl font-bold dark:text-white text-zinc-900">Design Studio</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Brand Color (Primary)</label>
                  <div className="flex gap-2">
                    <input type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" />
                    <input type="text" name="primary_color" value={formData.primary_color} onChange={handleChange} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors font-mono" placeholder="#4f46e5" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Accent Color (Secondary)</label>
                  <div className="flex gap-2">
                    <input type="color" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" />
                    <input type="text" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors font-mono" placeholder="#fbbf24" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Stamp Icon</label>
                <div className="flex flex-wrap gap-3">
                  {['coffee', 'heart', 'star', 'flame', 'zap', 'droplet', 'sun', 'trophy'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handlePropChange('stamp_icon', icon)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${formData.stamp_icon === icon ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent" : "bg-zinc-50 dark:bg-black text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500"}`}
                    >
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Background Image URL</label>
                <input type="url" name="background_url" value={formData.background_url} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="https://example.com/beautiful-bg.jpg" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Leave empty for a clean gradient design.</p>
              </div>
            </div>
          </div>
        </FeatureLock>

        {/* Security */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold dark:text-white text-zinc-900">Security & Fraud</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Anti-Fraud Security</label>
              <select name="security_mode" value={formData.security_mode} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors appearance-none">
                <option value="visual">Visual Confirmation (Cashier verifies screen)</option>
                <option value="time_lock">Time Lock (1 stamp per X minutes)</option>
                <option value="pin_code">Merchant PIN (Requires PIN entry)</option>
                <option value="dynamic_qr">Staff POS Terminal (Dynamic QR Codes)</option>
              </select>
            </div>

            {formData.security_mode === 'time_lock' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cooldown Duration (Minutes)</label>
                <input type="number" name="time_lock_hours" step="1" min="1" required value={formData.time_lock_hours} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. 5 minutes" />
              </div>
            )}

            {formData.security_mode === 'pin_code' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">4-Digit PIN Code</label>
                <input type="text" name="pin_code" maxLength={4} required value={formData.pin_code} onChange={handleChange} className="w-full font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Fixed to bottom right of form) */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={status === "loading"} className="bg-black dark:bg-white text-white dark:text-black py-3 px-8 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]">
            {status === "idle" && <><Save size={18} /> Save All Changes</>}
            {status === "loading" && "Saving..."}
            {status === "success" && <><Check size={18} /> Saved!</>}
          </button>
        </div>
      </form>

      {/* RIGHT COLUMN: LIVE PREVIEW */}
      <div className="xl:col-span-5 sticky top-24 pt-4 xl:pt-0">
        <div className="w-full relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 blur-3xl opacity-50 rounded-full" />
          
          <div className="relative text-center mb-6">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center justify-center gap-2">
              <Settings size={20} className="animate-spin-slow text-indigo-500" />
              Live Preview
            </h3>
            <p className="text-xs text-zinc-500 mt-1">See your changes in real-time instantly.</p>
          </div>

          {/* Device Mockup Shell */}
          <div className="border-[8px] border-zinc-900 shadow-2xl rounded-[3rem] overflow-hidden bg-black mx-auto max-w-[380px] pointer-events-none relative ring-1 ring-white/10">
            <div className="absolute top-0 w-full h-7 bg-zinc-900 flex justify-center z-50">
               <div className="w-32 h-5 bg-black rounded-b-3xl"></div>
            </div>
            
              <div className="h-[750px] w-full overflow-y-auto bg-zinc-950 p-6 pt-12 flex flex-col pointer-events-auto no-scrollbar">
              <LoyaltyCard 
                cafeId="preview"
                cardId="preview"
                cafeName={formData.name || "Cafe Name"}
                description={formData.description}
                logoUrl={cafe.logo_url}
                stampsRequired={parseInt(formData.stamps_required as string) || 9}
                currentStamps={3} // Provide a nice visual default
                primaryColor={formData.primary_color}
                secondaryColor={formData.secondary_color}
                theme={formData.theme}
                stampIcon={formData.stamp_icon}
                backgroundUrl={formData.background_url}
              />
            </div>
            
            <div className="absolute bottom-2 w-full flex justify-center z-50">
               <div className="w-1/3 h-1.5 bg-zinc-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
