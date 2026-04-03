import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const Scanner = dynamic(() => import("./scanner").then((mod) => mod.Scanner), { 
  ssr: false, 
  loading: () => <div className="text-zinc-500 animate-pulse">Loading Camera...</div>
});

export const metadata = {
  title: "Scan Loyalty Code",
};

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-8 pb-20">
      <div className="px-6 mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>
      </div>
      
      <div className="px-6 flex-1 flex flex-col text-center">
        <h1 className="text-3xl font-bold mb-2">Scan a Code</h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          Scan a cafe's QR code to join their loyalty program or get stamps!
        </p>

        <div className="w-full max-w-sm mx-auto bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative min-h-[300px] flex items-center justify-center">
          <Scanner />
        </div>
      </div>
    </div>
  );
}
