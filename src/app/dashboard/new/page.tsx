import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewCafePage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const createCafe = async (formData: FormData) => {
    "use server";

    const name = formData.get("name") as string;
    const stampsReq = formData.get("stamps_required") as string;
    const securityMode = formData.get("security_mode") as string;
    const timeLockHours = formData.get("time_lock_hours") as string;
    const pinCode = formData.get("pin_code") as string;
    
    // Auto-generate a URL-friendly slug (e.g., "Hmm Cafe" -> "hmm-cafe")
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { error } = await supabase.from("cafes").insert({
      name,
      slug,
      stamps_required: parseInt(stampsReq, 10) || 10,
      security_mode: securityMode,
      time_lock_hours: parseFloat(timeLockHours) || 2,
      pin_code: pinCode || "2024",
      owner_id: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        // Unique violation (slug already exists)
        return redirect("/dashboard/new?error=A cafe with a similar name already exists.");
      }
      return redirect(`/dashboard/new?error=${error.message}`);
    }

    return redirect("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black w-full p-8 font-sans">
      <div className="max-w-xl mx-auto w-full">
        <div className="flex items-center mb-8 gap-4">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white">
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Create a New Cafe</h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <form action={createCafe} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-1">
                Cafe Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Hmm Cafe"
                required
                className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-1">
                Stamps Required for a Free Coffee
              </label>
              <input
                name="stamps_required"
                type="number"
                defaultValue={10}
                min={1}
                max={20}
                required
                className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
              <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-1">
                    Protection Mode
                  </label>
                  <select 
                    name="security_mode" 
                    className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  >
                    <option value="visual">Visual (Barista physically looks at phone)</option>
                    <option value="time_lock">Time Lock (Cooldown between scans)</option>
                    <option value="pin_code">PIN Code (Customer types daily code)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-1">
                      Time Lock (Hours)
                    </label>
                    <input
                      name="time_lock_hours"
                      type="number"
                      step="0.5"
                      defaultValue={2}
                      className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-zinc-300 mb-1">
                      Barista PIN
                    </label>
                    <input
                      name="pin_code"
                      type="text"
                      maxLength={4}
                      defaultValue="2024"
                      className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {searchParams?.error && (
              <p className="p-3 bg-red-500/10 text-red-500 rounded-md text-sm">
                {searchParams.error}
              </p>
            )}

            <button
              type="submit"
              className="mt-4 bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Cafe Environment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}