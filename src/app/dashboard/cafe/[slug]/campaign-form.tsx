"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { createPromotion } from "./actions";

export function CampaignForm({ cafeId, audienceCount }: { cafeId: string, audienceCount: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || audienceCount === 0) return;
    
    setStatus("loading");
    
    try {
      // Save it to Supabase so it shows up on customers' dashboards
      await createPromotion(cafeId, title, body);
      
      // Simulate real world Email/SMS delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setTitle("");
        setBody("");
      }, 3500);
    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Failed to send promotion. Make sure the database schema is updated.");
    }
  };

  return (
    <form onSubmit={handleSend} className="flex-[2] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Quick Campaign</label>
        {audienceCount === 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">
            Need at least 1 opted-in user
          </span>
        )}
      </div>
      
      <input 
        type="text" 
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Promo Title (e.g., Free Pastry with Coffee)" 
        className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" 
      />
      
      <textarea 
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message body..." 
        className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors resize-none h-20"
      />
      
      <button 
        type="submit"
        disabled={status !== "idle" || audienceCount === 0}
        className="bg-black dark:bg-white text-white dark:text-black py-2 rounded-xl text-sm font-bold w-fit px-6 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        {status === "idle" && <><Send size={16} /> Send Promotion</>}
        {status === "loading" && "Sending..."}
        {status === "success" && <><Check size={16} /> Sent out to {audienceCount} {audienceCount === 1 ? 'customer' : 'customers'}!</>}
      </button>
    </form>
  );
}