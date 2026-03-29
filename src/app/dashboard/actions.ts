"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createMyReferralCode(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };
  
  const rawCode = formData.get("code") as string;
  if (!rawCode || rawCode.trim().length < 3) {
    return { success: false, message: "Code must be at least 3 characters" };
  }
  
  const cleanCode = rawCode.toUpperCase().trim().replace(/[^A-Z0-9_$]/g, '');
  
  const { error } = await supabase
    .from("referral_codes")
    .insert({
      referrer_id: user.id,
      code: cleanCode
    });

  if (error) {
    if (error.code === '23505') return { success: false, message: "This code is already taken. Try another." };
    return { success: false, message: "Failed to create code. " + error.message };
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}
