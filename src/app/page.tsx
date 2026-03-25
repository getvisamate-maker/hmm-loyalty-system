import Link from "next/link";
import { Coffee, QrCode, ShieldCheck, Megaphone, ChevronRight, BarChart3, Smartphone, Zap, Gift, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030014] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 relative z-50 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-2xl tracking-tighter">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl">
              <Coffee size={24} className="text-white" />
            </div>
            <span>hmmLoyalty</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden md:block"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-8 border border-indigo-500/20 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Live for Cafe Owners
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 max-w-5xl mx-auto leading-[1.1]">
            The punch card that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              actually brings them back.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Stop losing customers to lost paper cards. Launch a frictionless digital loyalty program in 5 minutes. No app downloads required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Free Trial <ChevronRight size={20} />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              See how it works
            </Link>
          </div>

          {/* Stunning floating mockup */}
          <div className="mt-32 relative w-full max-w-4xl mx-auto" style={{ perspective: '2000px' }}>
            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/40 to-purple-500/40 blur-[100px] rounded-[100%] opacity-50 transform -translate-y-12"></div>
            
            <div className="relative transform hover:rotate-0 transition-transform duration-700 ease-out" style={{ transform: 'rotateX(10deg) rotateY(-5deg)' }}>
              <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-2xl border border-white/10 p-2 md:p-4 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-[2rem] border border-white/5 p-8 md:p-12 relative overflow-hidden">
                  
                  {/* Decorative background within card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                  
                  {/* Mockup Top */}
                  <div className="flex justify-between items-center mb-16 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Coffee size={32} className="text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">Starlight Brews</h3>
                        <p className="text-indigo-200 font-medium">Digital Loyalty Pass</p>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <QrCode size={48} className="text-white/80" />
                      <span className="text-xs text-white/50 mt-2 tracking-widest uppercase">SCAN AT REG register</span>
                    </div>
                  </div>

                  {/* Stamp Grid */}
                  <div className="grid grid-cols-5 gap-4 md:gap-6 relative z-10 mb-12">
                    {Array.from({length: 10}).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-1000 ${
                          i < 7 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-100' 
                            : 'bg-black/40 border-white/10 scale-95'
                        }`}
                      >
                        {i < 7 ? (
                          <Coffee size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        ) : i === 9 ? (
                          <Gift size={28} className="text-white/20" />
                        ) : (
                          <Coffee size={28} className="text-white/10" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative z-10 bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
                    <div className="w-full flex-1">
                      <div className="flex justify-between text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                        <span>Reward Progress</span>
                        <span className="text-indigo-300">7 / 10</span>
                      </div>
                      <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[70%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] relative"></div>
                      </div>
                    </div>
                    <div className="whitespace-nowrap px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/10 shadow-inner">
                      3 Stamps to free coffee!
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Designed for real cafe operations</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">We built hmmLoyalty to solve the actual bottlenecks coffee shop owners face every single day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* Big Feature 1 */}
            <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-12">
                  <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Zero Friction Onboarding</h3>
                  <p className="text-zinc-400 text-lg max-w-md">Customers scan your QR code at the register and instantly get their card on their phone. No generic App Store downloads, no passwords to remember.</p>
                </div>
                {/* Mock UI snippet */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-fit backdrop-blur-md">
                  <QrCode size={40} className="text-white" />
                  <div className="h-12 w-1 bg-white/10 rounded-full"></div>
                  <div>
                    <p className="text-white font-bold">Scan to open wallet</p>
                    <p className="text-zinc-500 text-sm">Takes &lt; 3 seconds</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Feature 1 */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ironclad Security</h3>
                <p className="text-zinc-400">Time-locks keep people from double-scanning, and Merchant PINs ensure only your baristas give out stamps.</p>
              </div>
            </div>

            {/* Small Feature 2 */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center mb-6">
                  <Megaphone size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Direct Marketing</h3>
                <p className="text-zinc-400">Push special offers straight to the digital wallets of your regulars. Turn a slow Tuesday into a busy one.</p>
              </div>
            </div>

            {/* Big Feature 2 */}
            <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-500"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                    <BarChart3 size={28} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Real Analytics</h3>
                  <p className="text-zinc-400 text-lg">Know your customers. See exactly how many people are scanning, when they visit, and how many are coming back for rewards.</p>
                </div>
                <div className="flex-1 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
                  <div className="flex gap-4 items-end h-40 opacity-70">
                    {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/40 rounded-t-xl transition-all duration-1000 group-hover:h-full" style={{height: `${h}%`}}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-[3rem] blur-2xl"></div>
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full"></div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter text-white">
                Ready to upgrade your cafe?
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
                Join the modern coffee shops who have ditched paper cards and stepped into the digital age.
              </p>
              <Link 
                href="/login" 
                className="inline-flex bg-white text-black px-10 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] items-center gap-3"
              >
                Create Your Account <ChevronRight size={24} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white font-bold opacity-80">
            <Coffee size={20} />
            <span>hmmLoyalty</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-400 transition-colors text-sm font-medium">
              Service Agreement
            </Link>
            <p className="text-zinc-700 text-sm">© {new Date().getFullYear()} hmmLoyalty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
