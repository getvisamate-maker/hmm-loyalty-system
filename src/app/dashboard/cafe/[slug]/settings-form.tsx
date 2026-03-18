"use client";

import { useState } from "react";
import { updateCafeSettings } from "./actions";
import { Save, Check } from "lucide-react";

export function CafeSettingsForm({ cafe }: { cafe: any }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formData, setFormData] = useState({
    name: cafe.name,
    stamps_required: cafe.stamps_required,
    security_mode: cafe.security_mode || "visual",
    time_lock_hours: cafe.time_lock_hours || 2,
    pin_code: cafe.pin_code || "0000",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Settings */}
        <div className="space-y-4">
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
              <option value="time_lock">Time Lock (1 stamp per X hours)</option>
              <option value="pin_code">Merchant PIN (Requires PIN entry)</option>
            </select>
          </div>

          {formData.security_mode === 'time_lock' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cooldown Hours</label>
              <input 
                type="number" 
                name="time_lock_hours"
                step="0.5"
                min="0.5"
                required
                value={formData.time_lock_hours}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
              />
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