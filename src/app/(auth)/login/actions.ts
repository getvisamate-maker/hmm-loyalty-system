"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = formData.get("next") as string;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return redirect(`/login?message=${encodeURIComponent(error.message)}${nextPath ? `&next=${nextPath}` : ''}`);
  }

  return redirect(nextPath || "/dashboard");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const requestedRole = formData.get("role") as string;
  const nextPath = formData.get("next") as string;
  const marketingConsent = formData.get("marketing_consent") === "true";
  const termsAgreed = formData.get("terms_agreed") === "true";

  if (!fullName || fullName.trim().length < 2) {
      return redirect(`/login?message=${encodeURIComponent("Full Name is required for sign up")}${nextPath ? `&next=${nextPath}` : ''}`);
  }

  // Basic validation that they selected a role
  if (!requestedRole) {
      return redirect(`/login?message=${encodeURIComponent("Please select a role (Customer or Cafe Owner)")}${nextPath ? `&next=${nextPath}` : ''}`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const authData = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        // If they asked to be an owner, we still force "customer" initially 
        // but save their INTENT so admins can see it. If they ask for 'customer', they get 'customer'.
        role: "customer", 
        requested_role: requestedRole, 
        marketing_consent: marketingConsent,
        terms_agreed: termsAgreed,
      },
    },
  };

  const { data, error } = await supabase.auth.signUp(authData);

  if (error) {
    console.error("Signup error:", error.message);
    return redirect(`/login?message=${encodeURIComponent(error.message)}${nextPath ? `&next=${nextPath}` : ''}`);
  }

  if (!data?.session) {
    return redirect(`/login?message=${encodeURIComponent("This account might already exist. Please try signing in instead.")}${nextPath ? `&next=${nextPath}` : ''}`);
  }

  return redirect(nextPath || "/dashboard");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return redirect(`/login?message=${encodeURIComponent("Email is required for password reset.")}`);
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hmmloyalty.com'}/auth/callback?next=/dashboard/settings`
  });

  if (error) {
    console.error("Reset Password error:", error.message);
    return redirect(`/login?message=${encodeURIComponent("Could not send password reset email. Please try again.")}`);
  }

  return redirect(`/login?message=${encodeURIComponent("Check your email for the password reset link.")}`);
}
