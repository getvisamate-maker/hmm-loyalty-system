"use client";

import { useActionState, useState, useEffect } from "react";
import { createCafe } from "./actions";
import { Loader2 } from "lucide-react";

export function CreateCafeForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(createCafe, null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    // Basic slug generation logic
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  }, [name]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1">
          Cafe Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-zinc-600"
          placeholder="e.g. Joe's Coffee"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-400 mb-1">
          Store Slug (URL Component)
        </label>
        <div className="flex items-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-3">
          <span className="text-zinc-600 md:text-sm text-xs py-2 border-r border-zinc-800 pr-2 mr-2 select-none">hmm.loyalty/c/</span>
          <input
            type="text"
            name="slug"
            id="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full py-2 bg-transparent text-white focus:outline-none placeholder-zinc-600"
            placeholder="joes-coffee"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1">This will be your unique QR code URL.</p>
      </div>

      <div>
        <label htmlFor="referral_code" className="block text-sm font-medium text-zinc-400 mb-1">
          Referral Code (Optional)
        </label>
        <input
          type="text"
          name="referral_code"
          id="referral_code"
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-zinc-600 uppercase tracking-widest"
          placeholder="FRIEND20"
        />
        <p className="text-xs text-zinc-500 mt-1">If a partner referred you, enter their code here.</p>
      </div>

      <div>
        <label htmlFor="stamps_required" className="block text-sm font-medium text-zinc-400 mb-1">
          Stamps Required for Reward
        </label>
        <input
          type="number"
          name="stamps_required"
          id="stamps_required"
          min="1"
          defaultValue="10"
          required
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-zinc-600"
        />
        <p className="text-xs text-zinc-500 mt-1">Customers get a free reward after collecting this many stamps.</p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Creating...
          </>
        ) : (
          "Launch Cafe"
        )}
      </button>
    </form>
  );
}
