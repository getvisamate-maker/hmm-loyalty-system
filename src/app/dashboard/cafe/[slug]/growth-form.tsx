"use client";

import { useState } from "react";
import { updateCafeSettings } from "./actions";
import { FeatureLock } from "@/components/feature-lock";
import { FEATURES, PlanLevel, isFeatureEnabled } from "@/utils/features";

export function GrowthForm({ cafe, slug }: { cafe: any, slug: string }) {
  const [loading, setLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState(cafe?.google_review_url || "");
  const [threshold, setThreshold] = useState(cafe?.review_threshold || 3);
  const [winBackDays, setWinBackDays] = useState(cafe?.win_back_days || 14);
  const [winBackStamps, setWinBackStamps] = useState(cafe?.win_back_reward_stamps || 1);
  const [enableWinBack, setEnableWinBack] = useState(cafe?.enable_win_back || false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCafeSettings(cafe.id, {
        google_review_url: googleUrl,
        review_threshold: threshold,
        win_back_days: winBackDays,
        win_back_reward_stamps: winBackStamps,
        enable_win_back: enableWinBack,
      }, slug);
      alert("Growth settings saved successfully!");
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <FeatureLock 
        isLocked={!isFeatureEnabled(cafe.plan_level as PlanLevel, FEATURES.REVIEW_BOOSTER)}
        title="Unlock Review Booster"
        description="Automatically prompt loyal customers to leave 5-star reviews on Google."
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">🚀 Google Review Booster</h2>
            <p className="text-zinc-400">
              Automatically prompt happy customers to leave a 5-star Google review after they earn enough stamps.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Google Review Link</label>
              <input 
                type="text"
                value={googleUrl} 
                onChange={(e) => setGoogleUrl(e.target.value)} 
                placeholder="https://g.page/r/..." 
                className="flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-zinc-800 border-zinc-700 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Prompt After X Stamps</label>
              <input 
                type="number"
                value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value))} 
                min="1"
                className="flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-zinc-800 border-zinc-700 text-white" 
              />
            </div>
          </div>
        </div>
      </FeatureLock>

      <FeatureLock 
        isLocked={!isFeatureEnabled(cafe.plan_level as PlanLevel, FEATURES.WIN_BACK)}
        title="Unlock Win-Back Engine"
        description="Automatically email and re-engage customers who haven't visited in a while."
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">👋 Automated Win-Back Engine</h2>
            <p className="text-zinc-400">
              Automatically email customers who haven't visited in a while with a bonus stamp to win them back.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={enableWinBack} 
                onChange={(e) => setEnableWinBack(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-600"
              />
              <label className="text-sm font-medium text-zinc-300">Enable Win-Back Campaign</label>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Days Since Last Visit</label>
                <input 
                  type="number"
                  value={winBackDays} 
                  onChange={(e) => setWinBackDays(parseInt(e.target.value))} 
                  min="5"
                  disabled={!enableWinBack}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-zinc-800 border-zinc-700 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Bonus Stamps to Offer</label>
                <input 
                  type="number"
                  value={winBackStamps} 
                  onChange={(e) => setWinBackStamps(parseInt(e.target.value))} 
                  min="1"
                  disabled={!enableWinBack}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-zinc-800 border-zinc-700 text-white" 
                />
              </div>
            </div>
          </div>
        </div>
      </FeatureLock>

      <div className="flex justify-end">
        <button 
          type="button"
          onClick={handleSave} 
          disabled={loading} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm h-9 px-4 py-2"
        >
          {loading ? "Saving..." : "Save Automations"}
        </button>
      </div>
    </div>
  );
}
