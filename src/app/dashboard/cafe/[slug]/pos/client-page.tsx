"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ShieldCheck, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";

async function signToken(cafeId: string, secretKey: string) {
  const ts = Date.now();
  // We use Web Crypto API (SubtleCrypto)
  const enc = new TextEncoder();
  const keyData = enc.encode(secretKey);
  
  const key = await window.crypto.subtle.importKey(
    "raw", 
    keyData, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );

  const data = enc.encode(`${cafeId}:${ts.toString(16)}`);
  const signature = await window.crypto.subtle.sign("HMAC", key, data);
  
  // Convert ArrayBuffer to Hex String
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `${ts.toString(16)}:${sigHex}`;
}

export function PosTerminal({ cafeId, secretKey, cafeName }: { cafeId: string, secretKey: string, cafeName: string }) {
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(1); // Force immediate update
  const [error, setError] = useState("");

  useEffect(() => {
    // Determine the base URL from window location
    const origin = window.location.origin;
    
    // Cycle Logic
    const REFRESH_INTERVAL = 10; // Seconds between new codes
    
    const updateToken = async () => {
      try {
        const newToken = await signToken(cafeId, secretKey);
        // Construct Claim URL
        // Currently: https://app.com/c/slug?claim_token=...
        // Wait, slug is dynamic. We need to know the slug.
        // Actually, the QR code points to the claim endpoint.
        // Let's pass slug as prop.
        const claimUrl = `${origin}/c/claim/${cafeId}?token=${newToken}`;
        setToken(claimUrl);
        setTimeLeft(REFRESH_INTERVAL);
        setError("");
      } catch (err: any) {
        console.error("Token generation error:", err);
        setError("Security module compromised. Please refresh.");
      }
    };

    // Initial update
    updateToken();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          updateToken();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cafeId, secretKey]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <XCircle size={48} className="mb-4" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p className="font-medium animate-pulse">Initializing Secure Channel...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 selection:bg-indigo-500/30">
      
      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
          <ShieldCheck className="text-indigo-400" size={20} />
        </div>
        <div>
           <h1 className="font-bold text-sm tracking-wide text-zinc-400 uppercase">POS Terminal</h1>
           <p className="font-black text-white text-lg tracking-tight leading-none">{cafeName}</p>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <Link 
          href={`/dashboard/cafe/${encodeURIComponent(cafeName.toLowerCase().replace(/\s+/g, '-'))}`} // Fallback slug logic or pass slug
          className="text-xs font-bold text-zinc-500 hover:text-white transition-colors bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800"
        >
          Close Session
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm">
        
        {/* QR Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 relative group overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
           
           <div className="relative z-10 bg-white p-2 rounded-2xl">
              <QRCodeSVG 
                value={token} 
                size={280} 
                level="H" 
                includeMargin={true}
                className="w-full h-auto rounded-xl"
              />
              
              {/* Logo Overlay Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-16 h-16 bg-white rounded-full p-1 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                      {cafeName.substring(0,1)}
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Progress Bar */}
           <div className="absolute bottom-0 left-0 h-1.5 bg-zinc-100 w-full overflow-hidden">
             <div 
               className="h-full bg-indigo-500 transition-all duration-[1000ms] ease-linear"
               style={{ width: `${(timeLeft / 10) * 100}%` }}
             />
           </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-bold text-white tracking-tight">Scan for Stamp</h2>
           <p className="text-zinc-500 text-sm max-w-[200px] mx-auto">
             Code refreshes automatically in <span className="font-mono text-indigo-400 font-bold">{timeLeft}s</span>
           </p>
        </div>

      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>
      
    </div>
  );
}
