import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Coffee, ChevronRight, CheckCircle2, Ticket, LogOut, Plus, Settings, Megaphone } from "lucide-react";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch the user's profile to check their role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch the cafes this user owns
  const { data: cafes } = await supabase
    .from("cafes")
    .select("*")
    .eq("owner_id", user.id);

  // If the user's role is "owner" OR they have already created cafes in the past, they are an owner.
  const isOwner = profile?.role === "owner" || (cafes && cafes.length > 0);

  // Fetch wallet cards if customer (or for testing their own cafes)
  const { data: walletCards } = await supabase
    .from("loyalty_cards")
    .select("*, cafes(*)")
    .eq("user_id", user.id);

  // Fetch promotions if user has marketing consent and holds cards
  let promotions: any[] = [];
  if (!isOwner && profile?.marketing_consent && walletCards && walletCards.length > 0) {
    const cafeIds = walletCards.map((c: any) => c.cafe_id);
    const { data: promos } = await supabase
      .from("promotions")
      .select("*, cafes(name, logo_url)")
      .in("cafe_id", cafeIds)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (promos) promotions = promos;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black w-full p-8 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">
            {isOwner ? "Cafe Dashboard" : "My Digital Wallet"}
          </h1>
          <div className="flex gap-4">
            <Link href="/dashboard/settings">
              <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </Link>
            {isOwner && (
              <Link href="/dashboard/new">
                <button className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                  <Plus size={16} />
                  New Cafe
                </button>
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-medium text-black dark:text-white text-sm transition-colors">
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {isOwner ? (
          <div className="space-y-12">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 dark:text-white">Your Cafes</h2>
              
              {cafes && cafes.length > 0 ? (
                <ul className="space-y-4">
                  {cafes.map((cafe) => (
                      <li key={cafe.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-950/50 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border border-zinc-200 dark:border-zinc-800/50">
                            {cafe.logo_url ? (
                              <img src={cafe.logo_url} alt={cafe.name} className="w-full h-full object-cover" />
                            ) : (
                              <Coffee size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg dark:text-white">{cafe.name}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm leading-tight mt-1">{cafe.slug}</p>
                          </div>
                        </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <a 
                          href={`/c/${cafe.slug}`} 
                          target="_blank"
                          className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm whitespace-nowrap px-2"
                        >
                          Public View
                        </a>
                        <a 
                          href={`/dashboard/cafe/${cafe.slug}`} 
                          className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-80 transition-opacity w-full sm:w-auto text-center shadow-sm"
                        >
                          Manage
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
                  <div className="bg-zinc-200 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <Coffee size={32} />
                  </div>
                  <p className="mb-4 text-zinc-600 dark:text-zinc-400 font-medium">You haven&apos;t set up a cafe yet.</p>
                  <Link href="/dashboard/new">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95">
                      Launch Your Cafe
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {walletCards && walletCards.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-6 dark:text-white">Your Digital Wallet (Tested / Visited)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                  {walletCards.map((card) => {
                    const isReady = card.stamp_count >= card.cafes.stamps_required;
                    const progressPercentage = Math.min(100, (card.stamp_count / card.cafes.stamps_required) * 100);
                    
                    return (
                      <Link href={`/c/${card.cafes.slug}`} key={card.id} className="block group">
                        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:border-indigo-500/50">
                          
                          {/* Decorative Background gradient */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                          <div className="flex justify-between items-start mb-8 z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {card.cafes.logo_url ? (
                                  <img src={card.cafes.logo_url} alt={card.cafes.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Coffee size={24} />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl dark:text-white tracking-tight">{card.cafes.name}</h3>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                  Open Card <ChevronRight size={14} />
                                </p>
                              </div>
                            </div>
                            
                            {isReady ? (
                              <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                                <Ticket size={14} />
                                <span>Reward Ready!</span>
                              </div>
                            ) : (
                              <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">
                                {card.stamp_count} <span className="opacity-50">/</span> {card.cafes.stamps_required}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              <span>Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            
                            <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${isReady ? 'bg-green-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>

                            {/* Visual Dots representing stamps quickly */}
                            <div className="flex justify-between gap-1 pt-2">
                              {Array.from({ length: Math.min(card.cafes.stamps_required, 10) }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-1.5 flex-1 rounded-full ${i < card.stamp_count ? (isReady ? 'bg-green-500/50' : 'bg-indigo-600/50') : 'bg-zinc-100 dark:bg-zinc-800'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            
            {/* Wallet Section */}
            <div>
              <h2 className="text-xl font-bold mb-6 dark:text-white">Your Digital Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {walletCards && walletCards.length > 0 ? (
                  walletCards.map((card) => {
                    const isReady = card.stamp_count >= card.cafes.stamps_required;
                    const progressPercentage = Math.min(100, (card.stamp_count / card.cafes.stamps_required) * 100);

                    return (
                      <Link href={`/c/${card.cafes.slug}`} key={card.id} className="block group">
                        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:border-indigo-500/50">
                          {/* Decorative Background gradient */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                          
                          <div className="flex justify-between items-start mb-8 z-10">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {card.cafes.logo_url ? (
                                  <img src={card.cafes.logo_url} alt={card.cafes.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Coffee size={24} />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl dark:text-white tracking-tight">{card.cafes.name}</h3>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                  Open Card <ChevronRight size={14} />
                                </p>
                              </div>
                            </div>
                            
                            {isReady ? (
                              <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                                <Ticket size={14} />
                                <span>Reward Ready!</span>
                              </div>
                            ) : (
                              <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">
                                {card.stamp_count} <span className="opacity-50">/</span> {card.cafes.stamps_required}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              <span>Progress</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            
                            <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-3 overflow-hidden shadow-inner">
                              <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${isReady ? 'bg-green-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between gap-1 pt-2">
                              {Array.from({ length: Math.min(card.cafes.stamps_required, 10) }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full ${i < card.stamp_count ? (isReady ? 'bg-green-500/50' : 'bg-indigo-600/50') : 'bg-zinc-100 dark:bg-zinc-800'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Ticket size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your wallet is empty</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8">Visit your favorite participating cafes, scan their code, and start earning free coffee!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Promotions Section */}
            {promotions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Megaphone className="text-indigo-500" size={24} />
                  <h2 className="text-xl font-bold dark:text-white">Special Offers From Your Cafes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promotions.map((promo: any) => (
                    <div key={promo.id} className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
                       <div className="flex items-center gap-3 mb-4">
                         {promo.cafes?.logo_url ? (
                           <img src={promo.cafes.logo_url} alt={promo.cafes?.name} className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-700" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                             <Coffee size={14} className="text-indigo-600 dark:text-indigo-300" />
                           </div>
                         )}
                         <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">{promo.cafes?.name}</span>
                         <span className="text-xs text-indigo-400 ml-auto">{new Date(promo.created_at).toLocaleDateString()}</span>
                       </div>
                       <h3 className="font-bold text-lg mb-2 dark:text-white">{promo.title}</h3>
                       <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{promo.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
