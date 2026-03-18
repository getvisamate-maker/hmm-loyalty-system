import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const searchParams = await props.searchParams;
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nextPath = formData.get("next") as string;
    
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect(`/login?message=Could not authenticate user${nextPath ? `&next=${nextPath}` : ''}`);
    }

    return redirect(nextPath || "/dashboard");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const role = formData.get("role") as string;
    const nextPath = formData.get("next") as string;
    const marketingConsent = formData.get("marketing_consent") === "true";

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || "customer",
          marketing_consent: marketingConsent,
        },
      },
    });

    if (error) {
      return redirect(`/login?message=Could not authenticate user${nextPath ? `&next=${nextPath}` : ''}`);
    }

    return redirect(nextPath || "/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 bg-white dark:bg-black pt-20 mx-auto">
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          Sign In
        </h1>

        {/* Hidden field to pass the 'next' redirect URL to server actions */}
        {searchParams?.next && (
          <input type="hidden" name="next" value={searchParams.next} />
        )}
        
        <label className="text-md font-medium text-black dark:text-zinc-300" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 mb-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md font-medium text-black dark:text-zinc-300" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 mb-6 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <div className="flex justify-center gap-6 mb-8 text-sm">
          <label className="flex items-center gap-2 text-black dark:text-zinc-300 cursor-pointer">
            <input type="radio" name="role" value="customer" defaultChecked className="accent-black dark:accent-white w-4 h-4" />
            I am a Customer
          </label>
          <label className="flex items-center gap-2 text-black dark:text-zinc-300 cursor-pointer">
            <input type="radio" name="role" value="owner" className="accent-black dark:accent-white w-4 h-4" />
            I am a Cafe Owner
          </label>
        </div>

        <div className="flex justify-center mb-8 text-sm px-4">
          <label className="flex items-start gap-2 text-black dark:text-zinc-300 cursor-pointer text-left leading-tight">
            <input type="checkbox" name="marketing_consent" value="true" className="accent-black dark:accent-white w-4 h-4 mt-1 flex-shrink-0" />
            <span>I want to receive occasional promotional materials and special offers from my favorite cafes.</span>
          </label>
        </div>
        
        <button
          formAction={signIn}
          className="bg-black dark:bg-white text-white dark:text-black rounded-md px-4 py-2 text-foreground mb-2 font-medium"
        >
          Sign In
        </button>
        <button
          formAction={signUp}
          className="border border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-md px-4 py-2 text-foreground mb-2"
        >
          Sign Up
        </button>
        
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-center rounded-md text-red-500">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}