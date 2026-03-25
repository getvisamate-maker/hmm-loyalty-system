import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Coffee, LogOut, Settings, QrCode, Shield } from "lucide-react";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Check if the user is a Partner
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_partner")
    .eq("id", user.id)
    .single();

  // Check if admin
  const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  // ----------------------------------------------------------------------
  // VIEW FOR REGULAR CUSTOMERS (Non-Partners)
  // ----------------------------------------------------------------------
  if (!profile?.is_partner) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-indigo-500 animate-pulse">
          <QrCode size={40} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Hmm Loyalty</h1>
        <p className="text-zinc-400 max-w-sm mb-12">
          You are signed in as a customer. To start collecting stamps, simply scan the QR code at any participating cafe.
        </p>
        
        <div className="flex flex-col gap-4">
          <form action={async () => {
            "use server";
            const cookieStore = await cookies();
            const supabase = createClient(cookieStore);
            await supabase.auth.signOut();
            redirect("/login");
          }}>
            <button className="px-8 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors font-medium text-sm w-full">
              Sign Out
            </button>
          </form>

          {isAdmin && (
            <Link href="/admin" className="px-8 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-900 transition-colors font-medium text-sm flex items-center justify-center gap-2">
              <Shield size={16} />
              Admin Dashboard
            </Link>
          )}
        </div>
        
        <div className="mt-12 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl max-w-xs mx-auto">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold">Cafe Owners</p>
          <p className="text-xs text-zinc-400">
            If you are a cafe owner, please contact support to upgrade your account to a Partner account.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW FOR PARTNERS (Cafe Owners)
  // ----------------------------------------------------------------------
  const { data: cafes } = await supabase
    .from("cafes")
    .select("*")
    .eq("owner_id", user.id);

  return (
    <div className="min-h-screen bg-black p-8 font-sans text-zinc-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold">Cafe Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Settings size={16} />
              Settings
            </Link>
            <Link href="/dashboard/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus size={16} />
              New Cafe
            </Link>
            <form action={async () => {
              "use server";
              const cookieStore = await cookies();
              const supabase = createClient(cookieStore);
              await supabase.auth.signOut();
              redirect("/login");
            }}>
              <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-400">Your Cafes</h2>
          
          {cafes && cafes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cafes.map((cafe) => (
                <Link 
                  key={cafe.id} 
                  href={`/dashboard/cafe/${cafe.slug}`}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                      {cafe.logo_url ? (
                        <img src={cafe.logo_url} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Coffee size={24} />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{cafe.name}</h3>
                  <p className="text-sm text-zinc-500">{cafe.location || "No location set"}</p>
                </Link>
              ))}
            </div>
          ) : (
             // Empty State
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                <Coffee size={32} />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">You haven't set up a cafe yet.</h3>
              <p className="text-zinc-500 text-sm mb-6">Create your first digital loyalty card program.</p>
              <Link href="/dashboard/new" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold items-center gap-2 transition-colors">
                Launch Your Cafe
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
