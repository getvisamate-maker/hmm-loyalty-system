"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

export function Scanner() {
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // We only want to initialize the scanner on the client side
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        qrbox: { width: 250, height: 250 }, 
        fps: 5,
      },
      false
    );

    let isNavigating = false;

    scanner.render(
      (result) => {
        // Success callback
        scanner.clear(); // Stop scanning once we get a result
        if (isNavigating) return;
        isNavigating = true;

        try {
          // If the QR code is a full URL to our app (e.g. https://hmmloyalty.com/c/cafe-slug)
          if (result.includes("/c/")) {
            const path = result.substring(result.indexOf("/c/"));
            router.push(path);
          } else if (result.includes("/claim/")) {
              const path = result.substring(result.indexOf("/claim/"));
              router.push(path);
          } else if (result.startsWith("http")) {
             // Redirect to an external or other absolute URL
             window.location.href = result;
          } else {
             // Maybe it's just a slug or ID
             router.push(`/c/${result}`);
          }
        } catch (err) {
            console.error("Navigation error", err);
            isNavigating = false;
        }
      },
      (err) => {
        // Warning/Error callback - occurs frequently as it scans
        // You usually ignore these unless debugging
      }
    );

    // Cleanup when component unmounts
    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [router]);

  return (
    <div className="w-full relative">
      <style>{`
        #reader { width: 100% !important; border: none !important; }
        #reader button { 
            background: #4f46e5 !important; 
            color: white !important; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 8px; 
            font-weight: bold; 
            margin-top: 10px;
            cursor: pointer;
        }
        #reader__dashboard_section_csr span { color: #a1a1aa !important; }
      `}</style>
      <div id="reader"></div>
      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
    </div>
  );
}
