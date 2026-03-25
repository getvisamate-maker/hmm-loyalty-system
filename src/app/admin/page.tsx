import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { togglePartnerStatus } from "./actions";
import { Check, Shield, User } from "lucide-react";

// ⚠️ IMPORTANT: Add your actual email here to allow access
const ADMIN_EMAILS = ["hiremyminutes@gmail.com"]; 

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Verify 'Super Admin' Access
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    // If not authorized, kick them out
    return redirect("/dashboard");
  }

  // 2. Fetch All Profiles using Admin Client (Bypasses RLS)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <div>Error: Missing SUPABASE_SERVICE_ROLE_KEY</div>;
  }

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: profiles } = await adminDb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Super Admin Console</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-bold text-lg dark:text-white">User Management</h2>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              Total Users: {profiles?.length || 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {profiles?.map((profile: any) => (
                  <tr key={profile.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-medium dark:text-gray-200">{profile.full_name || "Unknown Name"}</div>
                          <div className="text-xs text-zinc-500 font-mono">{profile.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {profile.is_partner ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <Check size={12} />
                          Partner / Cafe Owner
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(profile.updated_at || profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server";
                        await togglePartnerStatus(profile.id, !profile.is_partner);
                      }}>
                        <button 
                          type="submit"
                          className={`font-medium text-xs px-4 py-2 rounded-lg transition-colors ${
                            profile.is_partner 
                              ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                          }`}
                        >
                          {profile.is_partner ? "Revoke Access" : "Approve as Partner"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
