export async function downloadMarketingAsset(type: string, cafeName: string, slug?: string) {
    let width = 1080;
    let height = 1080;
    let svg = '';

    const safeName = cafeName.toUpperCase().substring(0, 30); // Prevent overflow

    if (type.includes("Post")) {
        width = 1080; height = 1080;
        svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#09090b" />
              <stop offset="100%" stop-color="#18181b" />
            </linearGradient>
            <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1080" fill="url(#bg)" />
          <circle cx="900" cy="180" r="400" fill="url(#accent)" opacity="0.2" filter="blur(50px)" />
          <circle cx="180" cy="900" r="500" fill="url(#accent)" opacity="0.1" filter="blur(60px)" />
          
          <text x="120" y="300" font-family="system-ui, sans-serif" font-size="60" font-weight="bold" fill="#a1a1aa" letter-spacing="10">WELCOME TO</text>
          <text x="120" y="420" font-family="system-ui, sans-serif" font-size="120" font-weight="900" fill="#ffffff">${safeName}</text>
          
          <text x="120" y="600" font-family="system-ui, sans-serif" font-size="80" font-weight="800" fill="url(#accent)">EARN FREE REWARDS</text>
          <text x="120" y="680" font-family="system-ui, sans-serif" font-size="40" font-weight="normal" fill="#e4e4e7">Scan the QR code at our counter</text>
          <text x="120" y="740" font-family="system-ui, sans-serif" font-size="40" font-weight="normal" fill="#e4e4e7">to start collecting stamps today.</text>
          
          <path d="M120 850 h840 v4 h-840 z" fill="#27272a" />
          <text x="540" y="960" font-family="system-ui, sans-serif" font-size="30" font-weight="bold" fill="#71717a" text-anchor="middle">POWERED BY HMM LOYALTY</text>
        </svg>`;
    } else if (type.includes("Story")) {
        width = 1080; height = 1920;
        svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#09090b" />
              <stop offset="100%" stop-color="#18181b" />
            </linearGradient>
            <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4f46e5" />
              <stop offset="100%" stop-color="#ec4899" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#bg)" />
          <circle cx="540" cy="500" r="600" fill="url(#accent)" opacity="0.15" filter="blur(80px)" />
          <circle cx="540" cy="1500" r="500" fill="url(#accent)" opacity="0.1" filter="blur(60px)" />
          
          <text x="540" y="400" font-family="system-ui, sans-serif" font-size="60" font-weight="bold" fill="#a1a1aa" letter-spacing="15" text-anchor="middle">NEW AT</text>
          <text x="540" y="520" font-family="system-ui, sans-serif" font-size="100" font-weight="900" fill="#ffffff" text-anchor="middle">${safeName}</text>
          
          <rect x="240" y="700" width="600" height="800" rx="40" fill="#ffffff" />
          <rect x="240" y="700" width="600" height="800" rx="40" fill="url(#accent)" opacity="0.05" />
          <text x="540" y="850" font-family="system-ui, sans-serif" font-size="80" font-weight="900" fill="#18181b" text-anchor="middle">DIGITAL</text>
          <text x="540" y="940" font-family="system-ui, sans-serif" font-size="80" font-weight="900" fill="#18181b" text-anchor="middle">LOYALTY</text>
          <text x="540" y="1030" font-family="system-ui, sans-serif" font-size="80" font-weight="900" fill="#18181b" text-anchor="middle">CARD</text>
          
          <rect x="340" y="1150" width="400" height="250" rx="20" fill="#f4f4f5" />
          <circle cx="420" cy="1225" r="40" fill="#18181b" />
          <circle cx="540" cy="1225" r="40" fill="#d4d4d8" />
          <circle cx="660" cy="1225" r="40" fill="#d4d4d8" />
          <circle cx="420" cy="1325" r="40" fill="#d4d4d8" />
          <circle cx="540" cy="1325" r="40" fill="#d4d4d8" />
          <circle cx="660" cy="1325" r="40" fill="url(#accent)" />
          
          <text x="540" y="1650" font-family="system-ui, sans-serif" font-size="50" font-weight="bold" fill="#ffffff" text-anchor="middle">JUST SCAN TO EARN!</text>
          <text x="540" y="1800" font-family="system-ui, sans-serif" font-size="30" font-weight="bold" fill="#71717a" text-anchor="middle">POWERED BY HMM LOYALTY</text>
        </svg>`;
    } else if (type.includes("Poster")) {
        width = 2480; height = 3508;
        svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="2480" height="3508" viewBox="0 0 2480 3508">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f8fafc" />
            </linearGradient>
            <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4f46e5" />
              <stop offset="100%" stop-color="#9333ea" />
            </linearGradient>
          </defs>
          <rect width="2480" height="3508" fill="url(#bg)" />
          <rect x="140" y="140" width="2200" height="3228" fill="none" stroke="url(#accent)" stroke-width="10" rx="80" />
          
          <text x="1240" y="600" font-family="system-ui, sans-serif" font-size="120" font-weight="bold" fill="#71717a" letter-spacing="20" text-anchor="middle">WELCOME TO</text>
          <text x="1240" y="800" font-family="system-ui, sans-serif" font-size="240" font-weight="900" fill="#18181b" text-anchor="middle">${safeName}</text>
          
          <text x="1240" y="1150" font-family="system-ui, sans-serif" font-size="180" font-weight="900" fill="url(#accent)" text-anchor="middle">JOIN OUR</text>
          <text x="1240" y="1350" font-family="system-ui, sans-serif" font-size="180" font-weight="900" fill="url(#accent)" text-anchor="middle">LOYALTY</text>
          <text x="1240" y="1550" font-family="system-ui, sans-serif" font-size="180" font-weight="900" fill="url(#accent)" text-anchor="middle">PROGRAM</text>
          
          <rect x="740" y="1800" width="1000" height="1000" rx="80" fill="#ffffff" stroke="#e4e4e7" stroke-width="8" />
          
          <rect x="840" y="1900" width="200" height="200" fill="#18181b" rx="20"/>
          <rect x="1440" y="1900" width="200" height="200" fill="#18181b" rx="20"/>
          <rect x="840" y="2500" width="200" height="200" fill="#18181b" rx="20"/>
          <rect x="890" y="1950" width="100" height="100" fill="#ffffff" />
          <rect x="1490" y="1950" width="100" height="100" fill="#ffffff" />
          <rect x="890" y="2550" width="100" height="100" fill="#ffffff" />
          <rect x="915" y="1975" width="50" height="50" fill="#18181b" />
          <rect x="1515" y="1975" width="50" height="50" fill="#18181b" />
          <rect x="915" y="2575" width="50" height="50" fill="#18181b" />
          <path d="M1100 1900 h100 v100 h-100 z M1300 2000 h100 v100 h-100 z M1200 2100 h100 v100 h-100 z M1400 2200 h100 v100 h-100 z M900 2300 h100 v100 h-100 z M1100 2200 h100 v100 h-100 z M1500 2500 h100 v100 h-100 z M1300 2600 h100 v100 h-100 z M1100 2500 h200 v100 h-200 z M1400 2400 h200 v100 h-200 z" fill="#18181b" />
          
          <rect x="640" y="3000" width="1200" height="120" rx="60" fill="#18181b" />
          <text x="1240" y="3080" font-family="system-ui, sans-serif" font-size="65" font-weight="bold" fill="#ffffff" text-anchor="middle">SCAN WITH YOUR PHONE CAMERA</text>
          
          <text x="1240" y="3300" font-family="system-ui, sans-serif" font-size="50" font-weight="bold" fill="#a1a1aa" text-anchor="middle">POWERED BY HMM LOYALTY</text>
        </svg>`;
    } else {
        // Table Tent
        width = 1480; height = 2100;
        svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1480" height="2100" viewBox="0 0 1480 2100">
           <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="100%" stop-color="#f8fafc" />
            </linearGradient>
          </defs>
          <rect width="1480" height="2100" fill="url(#bg)" />
          
          <text x="740" y="300" font-family="system-ui, sans-serif" font-size="100" font-weight="900" fill="#18181b" text-anchor="middle">FREE COFFEE?</text>
          <text x="740" y="450" font-family="system-ui, sans-serif" font-size="60" font-weight="600" fill="#71717a" text-anchor="middle">Join the ${safeName} Club</text>
          
          <rect x="340" y="600" width="800" height="800" rx="60" fill="#ffffff" stroke="#e4e4e7" stroke-width="6" />
          
          <rect x="420" y="680" width="160" height="160" fill="#18181b" rx="16"/>
          <rect x="900" y="680" width="160" height="160" fill="#18181b" rx="16"/>
          <rect x="420" y="1160" width="160" height="160" fill="#18181b" rx="16"/>
          <rect x="460" y="720" width="80" height="80" fill="#ffffff" />
          <rect x="940" y="720" width="80" height="80" fill="#ffffff" />
          <rect x="460" y="1200" width="80" height="80" fill="#ffffff" />
          <rect x="480" y="740" width="40" height="40" fill="#18181b" />
          <rect x="960" y="740" width="40" height="40" fill="#18181b" />
          <rect x="480" y="1220" width="40" height="40" fill="#18181b" />
          <path d="M650 700 h100 v100 h-100 z M800 800 h100 v100 h-100 z M700 900 h100 v100 h-100 z M850 1000 h100 v100 h-100 z M600 1000 h100 v100 h-100 z M950 1000 h100 v100 h-100 z M1000 1150 h100 v100 h-100 z M750 1150 h100 v100 h-100 z M650 1250 h100 v100 h-100 z M850 1200 h150 v100 h-150 z" fill="#18181b" />
          
          <text x="740" y="1650" font-family="system-ui, sans-serif" font-size="70" font-weight="900" fill="#4f46e5" text-anchor="middle">SCAN TO JOIN</text>
          <text x="740" y="1750" font-family="system-ui, sans-serif" font-size="45" font-weight="500" fill="#52525b" text-anchor="middle">No app download required!</text>
          
          <text x="740" y="2000" font-family="system-ui, sans-serif" font-size="30" font-weight="bold" fill="#a1a1aa" text-anchor="middle">POWERED BY HMM LOYALTY</text>
        </svg>`;
    }

    try {
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    
                    try {
                        const dataUrl = canvas.toDataURL("image/png");
                        const a = document.createElement("a");
                        a.href = dataUrl;
                        a.download = `${cafeName.replace(/\s+/g, "_")}_${type}.png`;
                        a.click();
                        resolve();
                    } catch (e) {
                        console.error("Canvas export failed, falling back to SVG download:", e);
                        // Fallback to SVG download if canvas gets tainted
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${cafeName.replace(/\s+/g, "_")}_${type}.svg`;
                        a.click();
                        resolve();
                    }
                }
                setTimeout(() => URL.revokeObjectURL(url), 100);
            };
            
            img.onerror = () => {
                console.error("Image loading failed, downloading raw SVG instead.");
                const a = document.createElement("a");
                a.href = url;
                a.download = `${cafeName.replace(/\s+/g, "_")}_${type}.svg`;
                a.click();
                URL.revokeObjectURL(url);
                resolve();
            };
            
            img.src = url;
        });
    } catch (e) {
        console.error("Asset generation failed:", e);
        alert("Sorry, your browser does not support image generation. Try updating or using Chrome.");
    }
}
