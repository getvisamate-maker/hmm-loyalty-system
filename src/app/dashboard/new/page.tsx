import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateCafeForm } from "./form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewCafePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. PARTNER CHECK: Security Enforcement
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_partner, role")
    .eq("id", user.id)
    .single();

  const userEmail = user.email ? user.email.toLowerCase().trim() : "";
  const adminList = (process.env.ADMIN_EMAILS || "")
    .split(',')
    .map(e => e.toLowerCase().trim());
  const isAdmin = userEmail && adminList.includes(userEmail);

  const isApprovedPartner = profile?.is_partner === true || profile?.role === 'cafe_owner' || profile?.role === 'super_admin' || isAdmin;

  if (!isApprovedPartner) {
    // If not a partner, they cannot access this page. Redirect to dashboard (which handles customer view)
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="mb-8">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Cafe</h1>
            <p className="text-zinc-500">Configure your loyalty program details below.</p>
        </div>
        
        <CreateCafeForm userId={user.id} />
      </div>
    </div>
  );
}