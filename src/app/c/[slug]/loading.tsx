import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <p className="text-sm animate-pulse tracking-widest uppercase">Loading your loyalty card...</p>
    </div>
  );
}
