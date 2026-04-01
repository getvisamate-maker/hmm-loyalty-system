const fs = require('fs');
let content = fs.readFileSync('src/components/LandingClient.tsx', 'utf-8');

const oldQr = `<div className="relative w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
              {/* Corner squares */}
              <div className="flex justify-between">
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
              </div>
              
              {/* Random grid dots */}
              <div className="flex-1 flex flex-wrap gap-1 p-1 items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-3 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-4 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-4 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-2 bg-black rounded-sm"></div>
                <div className="w-2 h-3 bg-black rounded-sm"></div>
              </div>

              {/* Bottom corner square */}
              <div className="flex justify-between items-end">
                <div className="w-5 h-5 border-[3px] border-black rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
              </div>
            </div>`;

const newQr = `<div className="relative w-full h-full bg-white rounded flex items-center justify-center">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-black">
                {/* Top Left QR Marker */}
                <path fillRule="evenodd" clipRule="evenodd" d="M10 10H35V35H10V10ZM15 15H30V30H15V15Z" fill="currentColor"/>
                <rect x="20" y="20" width="5" height="5" fill="currentColor"/>
                
                {/* Top Right QR Marker */}
                <path fillRule="evenodd" clipRule="evenodd" d="M65 10H90V35H65V10ZM70 15H85V30H70V15Z" fill="currentColor"/>
                <rect x="75" y="20" width="5" height="5" fill="currentColor"/>
                
                {/* Bottom Left QR Marker */}
                <path fillRule="evenodd" clipRule="evenodd" d="M10 65H35V90H10V65ZM15 70H30V85H15V70Z" fill="currentColor"/>
                <rect x="20" y="75" width="5" height="5" fill="currentColor"/>
                
                {/* Smiley Face Elements */}
                {/* Eyes */}
                <rect x="45" y="45" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="60" y="45" width="5" height="5" rx="1" fill="currentColor"/>
                
                {/* Smile Arch */}
                <path d="M40 60 C 45 70, 65 70, 70 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
                
                {/* Extra QR noise */}
                <rect x="45" y="15" width="10" height="5" fill="currentColor"/>
                <rect x="80" y="45" width="10" height="10" fill="currentColor"/>
                <rect x="40" y="30" width="5" height="5" fill="currentColor"/>
                <rect x="55" y="20" width="5" height="15" fill="currentColor"/>
                <rect x="50" y="80" width="15" height="5" fill="currentColor"/>
                <rect x="75" y="75" width="15" height="5" fill="currentColor"/>
                <rect x="85" y="60" width="5" height="10" fill="currentColor"/>
                <rect x="15" y="45" width="15" height="5" fill="currentColor"/>
                <rect x="25" y="55" width="5" height="5" fill="currentColor"/>
              </svg>
            </div>`;

if(content.includes('Random grid dots')) {
  fs.writeFileSync('src/components/LandingClient.tsx', content.replace(oldQr, newQr));
  console.log('Successfully replaced QR code.');
} else {
  console.log('Could not find existing QR code string.');
}
