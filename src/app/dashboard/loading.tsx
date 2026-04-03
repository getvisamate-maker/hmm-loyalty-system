import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      <p className="text-sm font-mono tracking-widest uppercase">Fetching Dashboard Data...</p>
    </div>
  );
}
