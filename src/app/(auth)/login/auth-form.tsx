"use client";

import { useState } from "react";
import { signIn, signUp, resetPassword } from "./actions"; // Wait, I need to export these from the page or a separate file? Yes, separate file created.
import { useRouter } from "next/navigation";

export default function AuthForm({ message, next }: { message?: string, next?: string }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("customer");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(formData);
      } else {
        await signUp(formData);
      }
    } catch (e) {
      console.error(e);
      // If redirect happens in server action, it throws, so we catch it? 
      // Actually redirect throws Error 'NEXT_REDIRECT', which Next.js handles.
      // But if it's a real error, we might need to handle it.
      // However, we are not preventing default if we use `action={signIn}` directly.
      // But here I'm wrapping. 
      // It's better to use `action={isLogin ? signIn : signUp}` on the form directly to let Next handle it.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 bg-white dark:bg-black pt-20 mx-auto">
      <form
        // We can pass the server action directly to the action prop
        action={isLogin ? signIn : signUp}
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
      >
        {/* Hidden submit button to grab 'Enter' key presses strictly for main login/signup action FIRST */}
        <button type="submit" className="hidden" aria-hidden="true"></button>

        <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
          {isLogin ? "Sign In" : "Create Account"}
        </h1>

        {/* Hidden field for redirect */}
        {next && <input type="hidden" name="next" value={next} />}
        
        {/* Sign Up Fields */}
        {!isLogin && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
             <label className="text-md font-medium text-black dark:text-zinc-300" htmlFor="full_name">
              Full Name
            </label>
            <input
              className="w-full rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 mb-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              name="full_name"
              placeholder="e.g. Jane Doe"
              required={!isLogin}
            />
          </div>
        )}

        <label className="text-md font-medium text-black dark:text-zinc-300" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 mb-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        
        <div className="flex justify-between items-center mb-1">
          <label className="text-md font-medium text-black dark:text-zinc-300" htmlFor="password">
            Password
          </label>
          <button
            formAction={resetPassword}
            formNoValidate
            className="text-xs text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-4"
          >
            Forgot Password?
          </button>
        </div>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-zinc-200 dark:border-zinc-800 mb-6 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        {/* More fields for Sign Up */}
        {!isLogin && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="mb-6">
                <label className="block text-md font-medium text-black dark:text-zinc-300 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label 
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'customer' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black dark:ring-white' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    onClick={() => setRole('customer')}
                  >
                    <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="sr-only" />
                    <span className="text-2xl">☕️</span>
                    <span className="font-bold text-sm">Customer</span>
                  </label>
                  
                  <label 
                     className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'owner' ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black dark:ring-white' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                     onClick={() => setRole('owner')}
                  >
                    <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={() => setRole('owner')} className="sr-only" />
                    <span className="text-2xl">🏪</span>
                    <span className="font-bold text-sm">Cafe Owner</span>
                  </label>
                </div>
             </div>

            <div className="flex items-start gap-3 mb-6 px-1">
              <input type="checkbox" name="marketing_consent" value="true" className="accent-black dark:accent-white w-5 h-5 mt-0.5" id="marketing" />
              <label htmlFor="marketing" className="text-sm text-zinc-600 dark:text-zinc-400 leading-tight">
                I want to receive updates, promotions, and special offers from my favorite cafes.
              </label>
            </div>
            
             <div className="flex items-start gap-3 mb-6 px-1">
              <input type="checkbox" name="terms_agreed" value="true" required={!isLogin} className="accent-black dark:accent-white w-5 h-5 mt-0.5" id="terms" />
              <label htmlFor="terms" className="text-sm text-zinc-600 dark:text-zinc-400 leading-tight">
                I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
              </label>
            </div>
          </div>
        )}
        
        <button
          onClick={() => {}}
          className="bg-black dark:bg-white text-white dark:text-black rounded-xl px-4 py-3 text-foreground mb-4 font-bold active:scale-95 transition-transform"
        >
          {isLogin ? "Sign In" : "Create Account"}
        </button>
        
        <div className="text-center">
            <button
            type="button"
            onClick={() => {
                setIsLogin(!isLogin);
                // Reset role on toggle just to be clean? No, keep it.
            }}
            className="text-sm text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-4"
            >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
        
        {message && (
          <div className={`mt-6 p-4 border text-center rounded-xl text-sm animate-in zoom-in-95 ${
            message.includes('Success') 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
