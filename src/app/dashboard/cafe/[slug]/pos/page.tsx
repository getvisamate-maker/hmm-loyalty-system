import { getPosConfig } from "./actions";
import { PosTerminal } from "./client-page";
import { notFound, redirect } from "next/navigation";

export default async function PosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let config;
  let errorMsg = null;
  
  try {
    config = await getPosConfig(slug);
  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg || !config) {
    if (errorMsg?.includes("Upgrade")) {
       return (
         <div className="flex h-screen items-center justify-center bg-black text-white p-6 text-center">
            <div>
               <h1 className="text-2xl font-bold mb-2">Pro Feature Locked</h1>
               <p className="text-zinc-400 mb-6">The POS Terminal is available on the Pro plan.</p>
               <a href={`/dashboard/cafe/${slug}/settings`} className="px-6 py-2 bg-indigo-600 rounded-lg font-bold">Upgrade Plan</a>
            </div>
         </div>
       );
    }
    // General error
    return (
        <div className="flex h-screen items-center justify-center bg-black text-white p-6 text-center">
             <div>
               <h1 className="text-xl font-bold mb-2">Access Denied</h1>
               <p className="text-red-400 font-mono text-sm">{errorMsg || "Unknown error"}</p>
             </div>
         </div>
    );
  }

  // We have config
  return (
    <PosTerminal 
      cafeId={config.cafeId}
      secretKey={config.secretKey}
      cafeName={config.cafeName}
    />
  );
}