"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const DynamicScanner = dynamic(() => import("./scanner").then((mod) => mod.Scanner), { 
  ssr: false, 
  loading: () => (
    <div className="flex flex-col items-center justify-center text-zinc-500 gap-3 h-full">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-sm">Initiating Camera...</span>
    </div>
  )
});
