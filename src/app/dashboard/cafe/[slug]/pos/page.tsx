import { getPosConfig } from "./actions";
import { PosTerminal } from "./client-page";
import { notFound, redirect } from "next/navigation";

export default async function PosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const config = await getPosConfig(slug);
    
    // We also need the Cafe Name for display
    // getPosConfig already fetched Cafe, but didn't return name.
    // Let's rely on the client component to display name if passed or just fetch name here.
    // Optimization: Modify getPosConfig to return name too.
    
    return (
      <PosTerminal 
        cafeId={config.cafeId} 
        secretKey={config.secretKey} 
        cafeName={config.cafeName} 
      />
    );
  } catch (error: any) {
    if (error.message.includes("Upgrade")) {
       // Ideally redirect to upgrade page or show error
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
               <p className="text-red-400 font-mono text-sm">{error.message || "Unknown error"}</p>
            </div>
         </div>
    );
  }
}
