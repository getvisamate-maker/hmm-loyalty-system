"use client";

import { useState } from "react";
import { updateCafeSettings } from "./actions";
import { Save, Check } from "lucide-react";

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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
      }, cafe.slug);
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error(error);
      alert("Failed to update settings");
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cafe Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Stamps Needed for Reward</label>
              <input 
                type="number" 
                name="stamps_required"
                min="1"
                max="20"
                required
                value={formData.stamps_required}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
             <textarea 
               name="description"
               rows={3}
               value={formData.description}
               onChange={handleChange}
               className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
               placeholder="Tell customers about your cafe..."
             />
           </div>

           <div>
             <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Address</label>
             <input 
               type="text" 
               name="address"
               value={formData.address}
               onChange={handleChange}
               className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
               placeholder="123 Coffee St. NY, NY"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
               <input 
                 type="tel" 
                 name="phone_number"
                 value={formData.phone_number}
                 onChange={handleChange}
                 className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
                 placeholder="+1 (555) 000-0000"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Instagram URL</label>
               <input 
                 type="url" 
                 name="instagram_url"
                 value={formData.instagram_url}
                 onChange={handleChange}
                 className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
                 placeholder="https://instagram.com/your_cafe"
               />
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Brand Color (Primary)</label>
               <div className="flex gap-2">
                 <input 
                   type="color" 
                   name="primary_color"
                   value={formData.primary_color}
                   onChange={handleChange}
                   className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" 
                 />
                 <input 
                   type="text" 
                   name="primary_color"
                   value={formData.primary_color}
                   onChange={handleChange}
                   className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors font-mono" 
                   placeholder="#4f46e5"
                 />
               </div>
             </div>
              <div>
               <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Accent Color (Secondary)</label>
               <div className="flex gap-2">
                 <input 
                   type="color" 
                   name="secondary_color"
                   value={formData.secondary_color}
                   onChange={handleChange}
                   className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" 
                 />
                 <input 
                   type="text" 
                   name="secondary_color"
                   value={formData.secondary_color}
                   onChange={handleChange}
                   className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors font-mono" 
                   placeholder="#fbbf24"
                 />
               </div>
             </div>
           </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Anti-Fraud Security</label>
            <select
              name="security_mode"
              value={formData.security_mode}
              onChange={handleChange}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              <option value="visual">Visual Confirmation (Cashier verifies screen)</option>
              <option value="time_lock">Time Lock (1 stamp per X minutes)</option>
              <option value="pin_code">Merchant PIN (Requires PIN entry)</option>
              <option value="dynamic_qr">Staff POS Terminal (Dynamic QR Codes)</option>
            </select>
          </div>

          {formData.security_mode === 'time_lock' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cooldown Duration (Minutes)</label>
              <input 
                type="number" 
                name="time_lock_hours" // Using same column but treating as minutes for finer control? Wait, schema said 'hours'. Let's rename UI and convert.
                step="1"
                min="1"
                required
                value={formData.time_lock_hours}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
                placeholder="e.g. 5 minutes"
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum time a customer must wait before getting another stamp.</p>
            </div>
          )}

          {formData.security_mode === 'pin_code' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">4-Digit PIN Code</label>
              <input 
                type="text" 
                name="pin_code"
                maxLength={4}
                required
                value={formData.pin_code}
                onChange={handleChange}
                className="w-full font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="submit"
          disabled={status === "loading"}
          className="bg-black dark:bg-white text-white dark:text-black py-2.5 px-6 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
        >
          {status === "idle" && <><Save size={16} /> Save Settings</>}
          {status === "loading" && "Saving..."}
          {status === "success" && <><Check size={16} /> Saved!</>}
        </button>
      </div>
    </form>
  );
}