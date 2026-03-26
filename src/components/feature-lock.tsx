import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureLockProps {
  isLocked: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function FeatureLock({ isLocked, children, title = "Premium Feature", description = "Upgrade to unlock this feature." }: FeatureLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-100/50 dark:bg-black/50 backdrop-blur-[2px] p-6 text-center">
        <div className="mb-4 rounded-full bg-zinc-900 p-4 text-white shadow-lg">
          <Lock size={24} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        <button
          disabled
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Upgrade Plan (Coming Soon)
        </button>
      </div>
      <div className="opacity-20 blur-sm pointer-events-none filter grayscale">
        {children}
      </div>
    </div>
  );
}
