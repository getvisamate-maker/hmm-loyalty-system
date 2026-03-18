import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { User, Lock, ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function SettingsPage(props: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // Fetch current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Action: Update Profile Info (Full Name)
  const updateProfile = async (formData: FormData) => {
    "use server";
    const fullName = formData.get("full_name") as string;
    
    if (!fullName || fullName.trim().length === 0) {
      redirect("/dashboard/settings?error=Name cannot be empty");
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    redirect("/dashboard/settings?message=Profile successfully updated");
  };

  // Action: Update Password
  const updatePassword = async (formData: FormData) => {
    "use server";
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!password || password.length < 6) {
      redirect("/dashboard/settings?error=Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      redirect("/dashboard/settings?error=Passwords do not match");
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/dashboard/settings?message=Password successfully changed");
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black w-full p-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center mb-8 gap-4">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold dark:text-white tracking-tight">Account Settings</h1>
        </div>

        {/* Notifications */}
        {searchParams?.message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <p className="font-medium text-sm">{searchParams.message}</p>
          </div>
        )}
        {searchParams?.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p className="font-medium text-sm">{searchParams.error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Details Form */}
          <form action={updateProfile} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold dark:text-white">Personal Information</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-zinc-500 mt-2 ml-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={profile?.full_name || ""}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </form>

          {/* Security & Password Form */}
          <form action={updatePassword} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold dark:text-white">Security</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ml-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-indigo-500 active:scale-95">
                  Update Password
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}